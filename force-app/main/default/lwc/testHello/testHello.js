import { LightningElement } from 'lwc';

export default class TestHello extends LightningElement {
    greeting = 'Hello from LWC!';
    
    handleClick() {
        this.greeting = 'Button clicked!';
    }
}