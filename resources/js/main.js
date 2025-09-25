// Main JavaScript for Crowdin SRX Automation App

// View SRX Rules
function viewSRXRules() {
    fetch('/srx/rules')
        .then(response => response.json())
        .then(data => {
            if (data.isValid) {
                alert('SRX Rules are valid and loaded successfully!');
                console.log('SRX Rules:', data.rules);
            } else {
                alert('Warning: SRX Rules validation failed!');
            }
        })
        .catch(error => {
            console.error('Error fetching SRX rules:', error);
            alert('Error loading SRX rules');
        });
}

// Configure Parser
function configureParser() {
    const projectId = prompt('Enter project ID to configure:');
    if (!projectId) return;
    
    fetch(`/srx/configure/${projectId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Success: ${data.message}`);
        } else {
            alert(`Error: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error configuring parser:', error);
        alert('Error configuring parser');
    });
}

// Configure All Strava Projects
function configureAllProjects() {
    if (confirm('This will configure SRX rules for all projects in the Strava group. Continue?')) {
        alert('Feature coming soon! This will automatically detect and configure all Strava group projects.');
    }
}

// Check Status
function checkStatus() {
    const projectId = prompt('Enter project ID to check status:');
    if (!projectId) return;
    
    fetch(`/srx/status/${projectId}`)
        .then(response => response.json())
        .then(data => {
            if (data.configured) {
                alert(`Project ${projectId} is configured. Last updated: ${data.lastUpdated}`);
            } else {
                alert(`Project ${projectId} is not configured yet.`);
            }
        })
        .catch(error => {
            console.error('Error checking status:', error);
            alert('Error checking project status');
        });
}

// Trigger monitoring check
function triggerMonitoringCheck() {
    fetch('/monitoring/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(`Monitoring check completed!\n\nProcessed: ${data.processedFiles} files\nConfigured: ${data.configuredFiles} files\nErrors: ${data.errors.length}`);
        if (data.errors.length > 0) {
            console.error('Monitoring errors:', data.errors);
        }
        loadMonitoringStatus(); // Refresh status
    })
    .catch(error => {
        console.error('Error triggering monitoring check:', error);
        alert('Error triggering monitoring check');
    });
}

// View projects in the target group
function viewProjects() {
    fetch('/monitoring/projects')
        .then(response => response.json())
        .then(data => {
            if (data.projects.length === 0) {
                alert('No projects found in the target group.');
                return;
            }
            
            const projectList = data.projects.map(p => `• ${p.name} (ID: ${p.id})`).join('\n');
            alert(`Projects in ${data.targetGroup} group (${data.totalProjects} total):\n\n${projectList}`);
        })
        .catch(error => {
            console.error('Error fetching projects:', error);
            alert('Error fetching projects');
        });
}

// Load monitoring status
function loadMonitoringStatus() {
    fetch('/monitoring/status')
        .then(response => response.json())
        .then(data => {
            const statsDiv = document.getElementById('monitoring-stats');
            statsDiv.innerHTML = `
                <div class="monitoring-info">
                    <p><strong>Status:</strong> ${data.isEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
                    <p><strong>Target Group:</strong> ${data.stats.targetProjectGroup} (ID: ${data.stats.targetProjectGroupId})</p>
                    <p><strong>SRX Rules File:</strong> ${data.stats.srxRulesFile}</p>
                    <p><strong>Auto Configuration:</strong> ${data.stats.autoConfigurationEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
                    <p><strong>Last Check:</strong> ${new Date(data.lastCheckTime).toLocaleString()}</p>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error loading monitoring status:', error);
            document.getElementById('monitoring-stats').innerHTML = '<p>Error loading monitoring status</p>';
        });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Crowdin SRX Automation App initialized');
    
    // Load monitoring status
    loadMonitoringStatus();
    
    // Add any initialization logic here
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
});
