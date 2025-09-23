import React, { useState } from 'react';
import { Search, Phone, Mail, MessageCircle, FileText, Video, ChevronDown, ChevronUp } from 'lucide-react';

const HelpSupport = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "How do I create a new booking?",
            answer: "Navigate to the Booking section from the sidebar, click 'Add New Booking', fill in the guest details, select room type and dates, then confirm the booking."
        },
        {
            id: 2,
            question: "How can I manage room assignments?",
            answer: "Go to Room section to view all rooms, their status, and assign/reassign rooms to guests. You can also update room status from here."
        },
        {
            id: 3,
            question: "How do I process checkout?",
            answer: "In the Booking section, find the guest's booking, click on checkout, review charges, process payment, and complete the checkout process."
        },
        {
            id: 4,
            question: "How to assign tasks to staff?",
            answer: "Use the Task Assigned section to create new tasks, assign them to specific staff members, set priorities, and track completion status."
        },
        {
            id: 5,
            question: "How do I manage restaurant orders?",
            answer: "Navigate to Restaurant section, select Order to view current orders, add new orders, and manage KOT (Kitchen Order Tickets)."
        }
    ];

    const contactMethods = [
        {
            icon: Phone,
            title: "Phone Support",
            description: "Call us for immediate assistance",
            contact: "+91 98765 43210",
            availability: "24/7 Available"
        },
        {
            icon: Mail,
            title: "Email Support",
            description: "Send us your queries via email",
            contact: "support@buddhaavenue.com",
            availability: "Response within 24 hours"
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with our support team",
            contact: "Available in app",
            availability: "Mon-Fri 9AM-6PM"
        }
    ];

    const resources = [
        {
            icon: FileText,
            title: "User Manual",
            description: "Complete guide to using the system"
        },
        {
            icon: Video,
            title: "Video Tutorials",
            description: "Step-by-step video guides"
        },
        {
            icon: FileText,
            title: "Quick Start Guide",
            description: "Get started in minutes"
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8" style={{color: 'hsl(45, 100%, 20%)'}}>
                    Help & Support
                </h1>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                borderColor: 'hsl(45, 100%, 85%)',
                                focusRingColor: 'hsl(45, 43%, 58%)'
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQ Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
                            <h2 className="text-2xl font-semibold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>
                                Frequently Asked Questions
                            </h2>
                            
                            <div className="space-y-4">
                                {filteredFaqs.map(faq => (
                                    <div key={faq.id} className="border rounded-lg" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        <button
                                            onClick={() => toggleFaq(faq.id)}
                                            className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                                        >
                                            <span className="font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>
                                                {faq.question}
                                            </span>
                                            {expandedFaq === faq.id ? 
                                                <ChevronUp size={20} style={{color: 'hsl(45, 43%, 58%)'}} /> : 
                                                <ChevronDown size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                                            }
                                        </button>
                                        {expandedFaq === faq.id && (
                                            <div className="px-4 pb-4 text-gray-600">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Methods */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
                            <h2 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>
                                Contact Support
                            </h2>
                            
                            <div className="space-y-4">
                                {contactMethods.map((method, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                                        <method.icon size={24} style={{color: 'hsl(45, 43%, 58%)'}} />
                                        <div>
                                            <h3 className="font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>
                                                {method.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-1">{method.description}</p>
                                            <p className="text-sm font-medium" style={{color: 'hsl(45, 43%, 58%)'}}>
                                                {method.contact}
                                            </p>
                                            <p className="text-xs text-gray-500">{method.availability}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="bg-white rounded-lg shadow-sm p-6" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
                            <h2 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>
                                Resources
                            </h2>
                            
                            <div className="space-y-3">
                                {resources.map((resource, index) => (
                                    <button
                                        key={index}
                                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-left"
                                    >
                                        <resource.icon size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                                        <div>
                                            <h3 className="font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>
                                                {resource.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">{resource.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
                    <h2 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>
                        Quick Actions
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            className="p-4 rounded-lg text-white hover:opacity-90 transition-opacity"
                            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                        >
                            Report a Bug
                        </button>
                        <button 
                            className="p-4 rounded-lg text-white hover:opacity-90 transition-opacity"
                            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                        >
                            Request Feature
                        </button>
                        <button 
                            className="p-4 rounded-lg text-white hover:opacity-90 transition-opacity"
                            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                        >
                            Schedule Training
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;