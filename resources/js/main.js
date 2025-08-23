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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Crowdin SRX Automation App initialized');
    
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
