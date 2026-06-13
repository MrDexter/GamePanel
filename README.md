### Live Demo: [Frontend](https://panel.decspage.com/) - [Backend](https://panelapi.decspage.com/)

This project integrates my **Community API** and **Background Worker** into a unified, high-performance service.

**Cloud Infrastructure (Azure):**
*   **App Service:** Professional hosting with custom domain mapping via Cloudflare.
*   **SQL Server:** Relational data storage for players, gangs, and system jobs.
*   **Blob Storage:** Secure storage for CSV exports and processed data.
*   **Cost-Optimisation:** Architected as a manually-triggered worker to demonstrate efficient resource management on a Pay-As-You-Go model.

• Designed and built a full-stack dashboard for managing player data and permissions from a SQL database 
• Developed REST API using .NET with authentication and role-based permissions 
• Implemented hierarchical role-based access control (RBAC), enforcing permission changes based on rank, command roles, and department-level authority
• Built asynchronous background processing services for automated CSV exports and digital fulfilment workflows 
• Created React + TypeScript frontend for high-density data display and filtering 
• Deployed full system to Azure (App Service, Static Web Apps, Storage) 
• Implemented external authentication using Steam OpenID alongside JWT-based access control 
• Implemented Stripe-based payment processing, including secure checkout sessions and webhook handling
• Designed and built an order management system with automated fulfilment of digital products via background workers 
