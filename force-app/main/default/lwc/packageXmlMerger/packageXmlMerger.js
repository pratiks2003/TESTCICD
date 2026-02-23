// packageXmlMerger.js - MINIMAL VERSION
import { LightningElement, track } from 'lwc';
import mergePackageXmls from '@salesforce/apex/PackageXmlProcessor.processPackageXml';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PackageXmlMerger extends LightningElement {
    @track inputXml = '';
    @track mergedXml = '';
    @track isProcessing = false;
    @track showResults = false;
    @track statistics = {};

    get hasInput() {
        return this.inputXml && this.inputXml.trim().length > 0;
    }

    get hasResults() {
        return this.showResults && this.mergedXml;
    }

    handleInputChange(event) {
        this.inputXml = event.target.value;
        this.showResults = false;
    }

    loadSample() {
        this.inputXml = 'String myText = \'\\n"<?xml version=""1.0"" encoding=""UTF-8"" standalone=""yes""?>\\n<Package xmlns=""http://soap.sforce.com/2006/04/metadata"">\\n    <types>\\n        <members>Account.Test_Field__c</members>\\n        <name>CustomField</name>\\n    </types>\\n    <version>64.0</version>\\n</Package>"\\n\\n"<?xml version=""1.0"" encoding=""UTF-8"" standalone=""yes""?>\\n<Package xmlns=""http://soap.sforce.com/2006/04/metadata"">\\n    <types>\\n        <members>Account.Test_Field__c</members>\\n        <members>Account.Another_Field__c</members>\\n        <name>CustomField</name>\\n    </types>\\n    <version>63.0</version>\\n</Package>"\\n\';';
        this.showResults = false;
        this.showToast('Sample loaded!', 'info');
    }

    clearInput() {
        this.inputXml = '';
        this.showResults = false;
        this.mergedXml = '';
    }

    async processXml() {
        if (!this.hasInput) {
            this.showToast('Please paste your XML content first.', 'warning');
            return;
        }

        this.isProcessing = true;
        this.showResults = false;

        try {
            const result = await mergePackageXmls({ inputText: this.inputXml });
            
            this.mergedXml = result.mergedXml;
            this.statistics = {
                packagesProcessed: result.totalPackagesProcessed,
                totalComponents: result.totalComponentsFound,
                duplicatesRemoved: result.duplicatesRemoved,
                finalXmlLength: result.mergedXml.length
            };

            this.showResults = true;
            this.showToast(`Success! Merged ${this.statistics.packagesProcessed} packages.`, 'success');
            
        } catch (error) {
            console.error('Error:', error);
            this.showToast(`Error: ${error.body ? error.body.message : error.message}`, 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    copyToClipboard() {
        if (!this.mergedXml) return;
        
        const textArea = document.createElement('textarea');
        textArea.value = this.mergedXml;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.showToast('Copied to clipboard!', 'success');
    }

    showToast(message, variant) {
        const event = new ShowToastEvent({
            title: variant === 'error' ? 'Error' : variant === 'success' ? 'Success' : 'Info',
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}