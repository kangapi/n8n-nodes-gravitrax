import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';

export class EspAction implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'EspAction',
		name: 'espAction',
		icon: 'file:espAction.svg',
		group: ['transform'],
		version: 1,
		description: 'Send action to ESP',
		defaults: {
			name: 'EspAction',
		},
		inputs: ['main'],
		outputs: ['main'],

		properties: [
			// Resources and operations will go here
			{
				displayName: 'Esp IP Address',
				name: 'espIp',
				type: 'string',
				default: '',
				noDataExpression: true,
				required: true,
				description: 'IP address of the ESP device',
				placeholder: '10.0.4.200'
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{
						name: 'Move Servo',
						value: 'moveServo',
						description: 'Move a servo',
						action: 'Move a servo',
						displayOptions: {
							show: {
								action: [
									'servoAngle',
								],
							},
						},
					},
					{
						name: 'Switch Light',
						value: 'switchLight',
						description: 'Switch a light',
						action: 'Switch a light',
						displayOptions: {
							show: {
								action: [
									'lightState',
								],
							},
						},
					},
					{
						name: 'Make Sound',
						value: 'makeSound',
						description: 'Make a sound',
						action: 'Make a sound',
						displayOptions: {
							show: {
								action: [
									'soundIntensity',
								],
							},
						},
					}
				],
				default: 'moveServo',
				noDataExpression: true
			},
			{
				displayName: 'Servo Angle',
				name: 'servoAngle',
				type: 'number',
				default: 0,
				noDataExpression: true,
				description: 'Angle of the servo',
			},
			{
				displayName: 'Light State',
				name: 'lightState',
				type: 'options',
				options: [
					{
						name: 'On',
						value: 'on',
						description: 'Turn the light on',
						action: 'Turn the light on',
					},
					{
						name: 'Off',
						value: 'off',
						description: 'Turn the light off',
						action: 'Turn the light off',
					}
				],
				default: 'on',
				noDataExpression: true,
				description: 'State of the light',
			},
			{
				displayName: 'Sound Intensity',
				name: 'soundIntensity',
				type: 'number',
				default: 0,
				noDataExpression: true,
				description: 'Intensity of the sound',
			}
		],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Handle data coming from previous nodes
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const espIp = this.getNodeParameter('espIp', 0) as string;
		const action = this.getNodeParameter('action', 0) as string;

		// Loop through items and make API calls
		for (let i = 0; i < items.length; i++) {
			if (action === 'moveServo') {
				// Action: Move servo
				const servoAngle = this.getNodeParameter('servoAngle', i) as number;
				const options: OptionsWithUri = {
					method: 'POST',
					uri: `http://${espIp}/servo?angle=${servoAngle}`,
					// Other necessary request options
				};
				const responseData = await this.helpers.request(options);
				returnData.push({ json: responseData });
			} else if (action === 'switchLight') {
				// Action: Switch light
				const lightState = this.getNodeParameter('lightState', i) as string;
				const options: OptionsWithUri = {
					method: 'POST',
					uri: `http://${espIp}/led?state=${lightState}`,
					// Other necessary request options
				};
				const responseData = await this.helpers.request(options);
				returnData.push({ json: responseData });
			} else if (action === 'makeSound') {
				// Action: Make sound
				const soundIntensity = this.getNodeParameter('soundIntensity', i) as number;
				const options: OptionsWithUri = {
					method: 'POST',
					uri: `http://${espIp}/bip?params=${soundIntensity}`,
					// Other necessary request options
				};
				const responseData = await this.helpers.request(options);
				returnData.push({ json: responseData });
			}
		}

		return [returnData];
	}
}
