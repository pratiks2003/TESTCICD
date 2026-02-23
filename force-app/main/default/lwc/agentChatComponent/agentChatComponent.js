// agentChatComponent.js
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgentChatComponent extends LightningElement {
    @api language = 'en_US';
    @api orgId = '00DgL0000032y6Q';
    @api deploymentId = 'EmbededAgent';
    @api siteUrl = 'https://orgfarm-8d97b4d405-dev-ed.develop.my.site.com/ESWEmbededAgent1747225512209';
    @api scrtUrl = 'https://orgfarm-8d97b4d405-dev-ed.develop.my.salesforce-scrt.com';
    @api useScript = false; // Initialize to false per LWC best practices
    
    @track loadingState = 'Loading chat service...';
    @track hasError = false;
    @track debugInfo = [];
    @api showDebugInfo = false; // Initialize to false per LWC best practices
    
    isInitialized = false;
    
    get loadingClass() {
        return this.hasError ? 'loading-status has-error' : 'loading-status';
    }
    
    get statusIcon() {
        return this.hasError ? 'utility:error' : 'utility:spinner';
    }
    
    connectedCallback() {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            this.initChat();
        }, 1000);
    }
    
    initChat() {
        // Check if the component's default initialization has been overridden in settings
        if (this.useScript) {
            this.addDebugInfo('Using script loading method (configured in settings)');
            this.loadEmbeddedServiceScript();
        } else {
            this.addDebugInfo('Using direct embedding method (configured in settings)');
            this.embedChatSnippet();
        }
    }
    
    loadEmbeddedServiceScript() {
        try {
            this.addDebugInfo('Starting to load Embedded Service script');
            
            // Check if script is already loaded
            if (window.embeddedservice_bootstrap) {
                this.addDebugInfo('Bootstrap script already exists in window, initializing');
                this.initEmbeddedMessaging();
                return;
            }
            
            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = `${this.siteUrl}/assets/js/bootstrap.min.js`;
            
            scriptElement.onload = () => {
                this.addDebugInfo('Bootstrap script loaded successfully');
                this.loadingState = 'Script loaded, initializing chat...';
                
                // Add a small delay to ensure script is fully initialized
                setTimeout(() => {
                    this.initEmbeddedMessaging();
                }, 500);
            };
            
            scriptElement.onerror = (error) => {
                this.addDebugInfo(`Script loading error: ${error}`);
                this.handleScriptError();
                
                // Try the alternative approach when script loading fails
                this.addDebugInfo('Attempting to use direct snippet embedding as fallback');
                this.embedChatSnippet();
            };
            
            this.addDebugInfo(`Loading script from: ${this.siteUrl}/assets/js/bootstrap.min.js`);
            document.body.appendChild(scriptElement);
            this.loadingState = 'Loading chat script...';
        } catch (error) {
            this.addDebugInfo(`Exception in loadEmbeddedServiceScript: ${error.message}`);
            this.handleScriptError();
            
            // Try the alternative approach when script loading fails
            this.embedChatSnippet();
        }
    }
    
    embedChatSnippet() {
        try {
            this.addDebugInfo('Using direct snippet embedding method');
            
            // Create the initialization function
            const initFunctionScript = document.createElement('script');
            initFunctionScript.type = 'text/javascript';
            initFunctionScript.innerHTML = `
                function initEmbeddedMessaging() {
                    try {
                        embeddedservice_bootstrap.settings.language = '${this.language}';
                        embeddedservice_bootstrap.init(
                            '${this.orgId}',
                            '${this.deploymentId}',
                            '${this.siteUrl}',
                            {
                                scrt2URL: '${this.scrtUrl}'
                            }
                        );
                    } catch (err) {
                        console.error('Error loading Embedded Messaging: ', err);
                    }
                }
            `;
            document.body.appendChild(initFunctionScript);
            
            // Create the bootstrap script with onload handler
            const bootstrapScript = document.createElement('script');
            bootstrapScript.type = 'text/javascript';
            bootstrapScript.src = `${this.siteUrl}/assets/js/bootstrap.min.js`;
            bootstrapScript.onload = function() {
                // Call the initialization function when the script loads
                window.initEmbeddedMessaging();
            };
            
            // Add error handling
            bootstrapScript.onerror = (error) => {
                this.addDebugInfo(`Direct embedding: Script loading error: ${error}`);
                this.loadingState = 'Error: All methods failed to load chat';
                this.hasError = true;
                
                // Provide alternative solutions
                this.addDebugInfo('Possible solutions: Check CSP settings, verify URLs, or add script directly to the page template');
            };
            
            this.addDebugInfo('Appending bootstrap script to document body');
            document.body.appendChild(bootstrapScript);
            this.loadingState = 'Using alternative loading method...';
            
        } catch (error) {
            this.addDebugInfo(`Exception in embedChatSnippet: ${error.message}`);
            this.loadingState = 'Error: Failed to embed chat snippet';
            this.hasError = true;
        }
    }
    
    initEmbeddedMessaging() {
        try {
            this.addDebugInfo('Initializing Embedded Messaging');
            
            if (!window.embeddedservice_bootstrap) {
                this.addDebugInfo('ERROR: embeddedservice_bootstrap is not available in the window object');
                this.loadingState = 'Failed: Chat service not available';
                this.hasError = true;
                this.displayToast('Error', 'Chat service failed to load', 'error');
                return;
            }
            
            this.addDebugInfo('Setting language to: ' + this.language);
            window.embeddedservice_bootstrap.settings.language = this.language;
            
            this.addDebugInfo(`Initializing with orgId: ${this.orgId}, deploymentId: ${this.deploymentId}`);
            window.embeddedservice_bootstrap.init(
                this.orgId,
                this.deploymentId,
                this.siteUrl,
                {
                    scrt2URL: this.scrtUrl
                }
            );
            
            this.addDebugInfo('Embedded Service initialization called successfully');
            this.loadingState = 'Chat initialized!';
            
            // Hide loading message after a short delay
            setTimeout(() => {
                this.loadingState = '';
            }, 3000);
            
            console.log('Embedded Service initialized successfully');
        } catch (err) {
            this.addDebugInfo(`Error in initEmbeddedMessaging: ${err.message}`);
            this.loadingState = 'Error: Failed to initialize chat';
            this.hasError = true;
            console.error('Error loading Embedded Messaging: ', err);
            this.displayToast('Error', 'Failed to initialize chat service: ' + err.message, 'error');
        }
    }
    
    handleScriptError() {
        this.loadingState = 'Error: Failed to load chat script';
        this.hasError = true;
        console.error('Failed to load the Embedded Service script');
        this.displayToast('Error', 'Chat service script failed to load', 'error');
    }
    
    displayToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
    
    addDebugInfo(message) {
        console.log(`AgentChat Debug: ${message}`);
        this.debugInfo.push(`${new Date().toISOString().substring(11, 23)}: ${message}`);
    }
}