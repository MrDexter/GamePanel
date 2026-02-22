using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using BackgroundJobs.Services;

namespace BackgroundJobs.Background;

// Added for the manual trigger for Azure hosting. Not needed normally with the "BackgroundService" and Protected override Task
public interface IJobWorker
{
    Task ExecuteAsync(CancellationToken stopToken);
}

public class JobWorker : IJobWorker //BackgroundService
{
    private readonly IServiceScopeFactory _serviceProvider; //IServiceProvider
    private readonly ILogger<JobWorker> _logger;

    public JobWorker(IServiceScopeFactory  serviceProvider, ILogger<JobWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    // protected override async Task ExecuteAsync(CancellationToken stopToken)
    public async Task ExecuteAsync(CancellationToken stopToken)
    {
        _logger.LogInformation("Background Worker Started");

        while (!stopToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();

                var _jobService = scope.ServiceProvider.GetRequiredService<IJobService>();
                var _processorService = scope.ServiceProvider.GetRequiredService<IProcessorService>();

                var job = await _jobService.GetWaitingJobAsync(stopToken);
                if (job is null)
                {
                    // No job found, wait
                    _logger.LogInformation("No Job Found Waiting...");
                    await Task.Delay(TimeSpan.FromSeconds(5), stopToken);
                    continue;
                }
                _logger.LogInformation("Job Found Starting Processing");

                // var status = await _jobService.UpdateJobStatusAsync(job.Id, "Processing", "Processing");

                // Perform Process
                var result = await _processorService.GetJobProcessorAsync(job, stopToken);

                if (result is null)
                {
                    _logger.LogInformation("Processing Failed, Processor Not Found");
                    await _jobService.UpdateJobStatusAsync(job.Id, "Failed", "No Processor Found");
                    continue;
                }
                _logger.LogInformation("Processing Complete");
                await _jobService.UpdateJobStatusAsync(job.Id, "Complete", result);
            }
            catch (OperationCanceledException) // Canceled
            {
            }
            catch (Exception exception)// Job Failed
            {
                _logger.LogError(exception, "Failed Processing");
            }
        }
    }
}