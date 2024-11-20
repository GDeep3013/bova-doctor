'use client'
import React from 'react';
import AppLayout from 'components/Applayout';
export default function PrivacyPolicy() {

    return (

        <AppLayout>
            <div className=" min-h-screen py-10 ">
                <div className="max-w-4xl mx-auto rounded-lg  p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
                    <p className="text-gray-700 mb-4">
                        Welcome to our Doctor Panel application. This Privacy Policy outlines how we collect, use, and protect your data when you create patients and manage medication plans on our platform.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
                    <ul className="list-disc list-inside text-gray-700 mb-6">
                        <li>Personal Information: Includes name, email, contact details, and medical data for both doctors and patients.</li>
                        <li>Usage Data: Information on how the platform is used, such as login times and activity logs.</li>
                        <li>System Data: Device and browser information used to access the application.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
                    <ul className="list-disc list-inside text-gray-700 mb-6">
                        <li>To create and manage patient profiles and medication plans.</li>
                        <li>To ensure secure and efficient use of the platform.</li>
                        <li>To comply with legal and regulatory requirements.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Data Security</h2>
                    <p className="text-gray-700 mb-6">
                        We implement strict security measures to safeguard your data, including encryption, secure servers, and regular audits. Access to sensitive data is restricted to authorized personnel only.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Sharing Your Information</h2>
                    <p className="text-gray-700 mb-6">
                        We do not share your personal information with third parties unless required for:</p>
                        <ul className="list-disc list-inside mt-2">
                            <li>Legal compliance or law enforcement requests.</li>
                            <li>Third-party integrations explicitly authorized by you (e.g., pharmacies or labs).</li>
                        </ul>
                    

                    <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-2">5. Your Rights</h2>
                    <ul className="list-disc list-inside text-gray-700 mb-6">
                        <li>Access: You can request access to your stored data.</li>
                        <li>Correction: Update or correct inaccurate information.</li>
                        <li>Deletion: Request deletion of your data, subject to legal obligations.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Changes to This Policy</h2>
                    <p className="text-gray-700 mb-6">
                        We may update this Privacy Policy from time to time. We will notify you of any significant changes through the platform or via email.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Contact Us</h2>
                    <p className="text-gray-700 ">
                        If you have questions or concerns about this Privacy Policy, please contact us at:</p>                        
                        <strong>Email:</strong> support@bova.com
                 
                </div>
            </div>

        </AppLayout>
    );
}
