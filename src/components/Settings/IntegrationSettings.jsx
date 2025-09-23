import React, { useState } from 'react';
import { Save, CreditCard, MessageSquare, Mail, Zap, CheckCircle, XCircle, Settings, Key, Globe } from 'lucide-react';

const IntegrationSettings = () => {
    const [paymentGateways, setPaymentGateways] = useState([
        { id: 1, name: 'Razorpay', enabled: true, status: 'Connected', apiKey: 'rzp_test_***', secretKey: '***', testMode: true },
        { id: 2, name: 'Stripe', enabled: false, status: 'Disconnected', apiKey: '', secretKey: '', testMode: true },
        { id: 3, name: 'PayU', enabled: false, status: 'Disconnected', apiKey: '', secretKey: '', testMode: true }
    ]);
    
    const [communicationServices, setCommunicationServices] = useState([
        { id: 1, name: 'Twilio SMS', type: 'sms', enabled: false, status: 'Disconnected', config: { accountSid: '', authToken: '', fromNumber: '' } },
        { id: 2, name: 'MSG91', type: 'sms', enabled: true, status: 'Connected', config: { apiKey: 'msg91_***', senderId: 'BUDDHA' } },
        { id: 3, name: 'SendGrid', type: 'email', enabled: true, status: 'Connected', config: { apiKey: 'sg_***', fromEmail: 'noreply@buddhaavenue.com' } },
        { id: 4, name: 'SMTP', type: 'email', enabled: false, status: 'Disconnected', config: { host: '', port: 587, username: '', password: '' } }
    ]);
    
    const [thirdPartyApps, setThirdPartyApps] = useState([
        { id: 1, name: 'Google Analytics', enabled: true, status: 'Connected', config: { trackingId: 'GA-***' } },
        { id: 2, name: 'WhatsApp Business', enabled: false, status: 'Disconnected', config: { phoneNumber: '', accessToken: '' } },
        { id: 3, name: 'Booking.com', enabled: false, status: 'Disconnected', config: { hotelId: '', apiKey: '' } },
        { id: 4, name: 'Expedia', enabled: false, status: 'Disconnected', config: { propertyId: '', apiKey: '' } }
    ]);
    
    const [webhooks, setWebhooks] = useState([
        { id: 1, name: 'Payment Success', url: 'https://buddhaavenue.com/webhook/payment', enabled: true, events: ['payment.success', 'payment.failed'] },
        { id: 2, name: 'Booking Updates', url: 'https://buddhaavenue.com/webhook/booking', enabled: true, events: ['booking.created', 'booking.cancelled'] }
    ]);

    const handlePaymentToggle = (id) => {
        setPaymentGateways(prev => prev.map(gateway => 
            gateway.id === id ? { ...gateway, enabled: !gateway.enabled } : gateway
        ));
    };
    
    const handleCommunicationToggle = (id) => {
        setCommunicationServices(prev => prev.map(service => 
            service.id === id ? { ...service, enabled: !service.enabled } : service
        ));
    };
    
    const handleThirdPartyToggle = (id) => {
        setThirdPartyApps(prev => prev.map(app => 
            app.id === id ? { ...app, enabled: !app.enabled } : app
        ));
    };
    
    const handleWebhookToggle = (id) => {
        setWebhooks(prev => prev.map(webhook => 
            webhook.id === id ? { ...webhook, enabled: !webhook.enabled } : webhook
        ));
    };
    
    const getStatusIcon = (status) => {
        return status === 'Connected' ? 
            <CheckCircle size={16} className="text-green-600" /> : 
            <XCircle size={16} className="text-red-600" />;
    };
    
    const getStatusColor = (status) => {
        return status === 'Connected' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-sm" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>Integrations</h2>
            
            <div className="space-y-8">
                {/* Payment Gateways */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Payment Gateways</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paymentGateways.map(gateway => (
                            <div key={gateway.id} className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{gateway.name}</span>
                                        {getStatusIcon(gateway.status)}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={gateway.enabled}
                                        onChange={() => handlePaymentToggle(gateway.id)}
                                        className="h-4 w-4"
                                        style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(gateway.status)}`}>
                                            {gateway.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Mode:</span>
                                        <span>{gateway.testMode ? 'Test' : 'Live'}</span>
                                    </div>
                                    {gateway.enabled && (
                                        <button className="w-full mt-2 px-3 py-1 text-xs text-white rounded" style={{backgroundColor: 'hsl(45, 43%, 58%)'}}>
                                            Configure
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Communication Services */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Communication Services</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Service
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Type
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Status
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Enabled
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {communicationServices.map(service => (
                                    <tr key={service.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <div className="flex items-center gap-2">
                                                {service.type === 'sms' ? <MessageSquare size={16} /> : <Mail size={16} />}
                                                {service.name}
                                            </div>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <span className="capitalize">{service.type}</span>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(service.status)}
                                                <span className="text-sm">{service.status}</span>
                                            </div>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <input
                                                type="checkbox"
                                                checked={service.enabled}
                                                onChange={() => handleCommunicationToggle(service.id)}
                                                className="h-4 w-4"
                                                style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                            />
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                                <Settings size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Third Party Apps */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Third Party Applications</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {thirdPartyApps.map(app => (
                            <div key={app.id} className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} />
                                        <span className="font-medium">{app.name}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={app.enabled}
                                        onChange={() => handleThirdPartyToggle(app.id)}
                                        className="h-4 w-4"
                                        style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                    {app.enabled && (
                                        <button className="px-3 py-1 text-xs text-white rounded" style={{backgroundColor: 'hsl(45, 43%, 58%)'}}>
                                            Setup
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Webhooks */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Key size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Webhooks</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Name
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        URL
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Events
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {webhooks.map(webhook => (
                                    <tr key={webhook.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {webhook.name}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <span className="text-sm text-gray-600">{webhook.url}</span>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <span className="text-sm">{webhook.events.length} events</span>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <input
                                                type="checkbox"
                                                checked={webhook.enabled}
                                                onChange={() => handleWebhookToggle(webhook.id)}
                                                className="h-4 w-4"
                                                style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end">
                    <button 
                        className="flex items-center gap-2 px-6 py-3 text-white rounded hover:opacity-90"
                        style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                    >
                        <Save size={16} /> Save Integration Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntegrationSettings;