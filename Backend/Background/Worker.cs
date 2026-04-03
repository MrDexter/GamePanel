using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using DecsPage.Services;
using DecsPage.Models;

namespace DecsPage.Background;

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
            IJobService? _jobService = null;
            Job? job = null;
            try
            {
                using var scope = _serviceProvider.CreateScope();

                _jobService = scope.ServiceProvider.GetRequiredService<IJobService>();
                var _processorService = scope.ServiceProvider.GetRequiredService<IProcessorService>();

                job = await _jobService.GetWaitingJobAsync(stopToken);
                if (job is null)
                {
                    // No job found, wait
                    _logger.LogInformation("No Job Found Waiting...");
                    await Task.Delay(TimeSpan.FromSeconds(5), stopToken);
                    continue;
                }
                _logger.LogInformation("Job Found ID: " + job.Id);
                await Task.Delay(TimeSpan.FromSeconds(5), stopToken); // Delay added to be able to view process live
                // Perform Process
                var result = await _processorService.GetJobProcessorAsync(job, stopToken);
                await Task.Delay(TimeSpan.FromSeconds(5), stopToken); // Delay added to be able to view process live
                _logger.LogInformation("Job Complete ID: " + job.Id);
                await _jobService.UpdateJobStatusAsync(job.Id, "Complete", result);
            }
            catch (OperationCanceledException error) // Canceled
            {
                if (_jobService is not null && job is not null)
                    await _jobService!.UpdateJobStatusAsync(job.Id, "Cancelled", error.Message);
                _logger.LogInformation(error.Message);
            }
            catch (Exception error)// Job Failed
            {
                if (_jobService is not null && job is not null)
                    await _jobService!.UpdateJobStatusAsync(job.Id, "Failed", error.Message);
                _logger.LogError(error.Message);
            }
        }
    }
}