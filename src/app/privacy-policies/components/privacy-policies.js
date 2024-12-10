'use client'
import React from 'react';
import AppLayout from 'components/Applayout';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
    const router = useRouter();

    return (

        <AppLayout>
                <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>

            <div className='terms-services max-w-[1100px]  p-4'>
                <div className='paragragh'>
                    {/* <img alt="Logo" className="max-w-[150px] max-[992px]:max-w-[120px] mb-5" src="/images/dash-logo.png" /> */}
                    <h4 className='text-3xl font-semibold'> Privacy Statement </h4>
                    <p className='text-[15px] my-3 text-gray-500'><strong>BOVA</strong> is dedicated to safeguarding your privacy and ensuring a positive experience when using our website and services (collectively, the &apos;&apos;Services&apos;&apos;). This Privacy Statement outlines how we handle your personal information, your rights regarding your data, and our obligations under applicable laws. By using our Services, you acknowledge and agree to the practices outlined in this Privacy Statement.</p>
                    <p className='text-[15px] my-3 text-gray-500'>If you do not understand or agree with the terms of this Privacy Statement, please refrain from using our Services. If you are using our Services on behalf of another person or entity, you confirm that you are authorized to act on their behalf and agree to this Privacy Statement on their behalf.</p>
                    <p className='text-[15px] my-3 text-gray-500'>This Privacy Statement applies to interactions with BOVA across all platforms, including our websites, any future mobile applications, social media channels, and offline engagements such as visits to our offices or attendance at BOVA-hosted events. For region-specific terms, additional privacy notices, or information about specific products or services, this Privacy Statement supplements any other policies provided to you.</p>

                    <h4 className='text-lg font-semibold'> Collection of Personal Information </h4>
                    <p className='text-[15px] my-3 text-gray-500'>We collect two types of information: personal information and non-personal information.</p>
                    <h5 className='text-lg '> Personal Information</h5>
                    <p className='text-[15px] my-3 text-gray-500'>&apos;&apos;Personal information&apos;&apos; refers to any data that identifies you directly or indirectly, such as:</p>

                    <ul className='pl-[27px]'>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Name, date of birth, and contact details (e.g., email, phone number, address). </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Login credentials (e.g., account username, password). </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Payment and financial details (e.g., credit card number, billing information). </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Health-related information where applicable, such as medical history or prescriptions.</li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Professional details (e.g., employment history, certifications). </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Interactions with our Services (e.g., order history, preferences). </li>
                    </ul>

                    <p className='text-[15px] my-3 text-gray-500'>We collect this information when:</p>
                    <ul className='pl-[27px]'>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>You create an account with us. </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>You make purchases or use our Services. </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>You communicate with us or respond to our communications. </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>You apply for employment with us or interact with our advertising. </li>
                    </ul>

                    <h5 className='text-lg '>Non-Personal Information</h5>
                    <p className='text-[15px] my-3 text-gray-500'>&apos;&apos;Non-personal information&apos;&apos; refers to aggregated or anonymized data that does not identify you personally. For example, we collect usage data like device type, browser settings, IP address, geolocation, and interactions with our website to improve functionality and user experience.</p>

                    <h4 className='text-lg font-semibold'> Use of Personal Information </h4>
                    <p className='text-[15px] my-3 text-gray-500'>We use your personal information to:</p>
                    <ul className='pl-[27px]'>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Provide and improve our Services.</li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Process transactions and fulfill orders. </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Communicate with you about your account, orders, or updates. </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Send promotional materials and educational content (when you consent to receive them).</li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Maintain the security and functionality of our systems.</li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>Comply with legal requirements or enforce our Terms of Service. </li>
                    </ul>
                    <h4 className='text-lg font-semibold'> Sharing of Personal Information</h4>
                    <p className='text-[15px] my-3 text-gray-500'>We do not sell personal information. However, we may share it under limited circumstances, such as:</p>
                    <ul className='pl-[27px]'>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>With service providers assisting us in delivering our Services (e.g., payment processors, cloud storage providers).</li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>With regulatory or legal authorities, when required by law. </li>
                        <li className='text-[15px] my-1 text-gray-500 list-disc'>With your explicit consent or as otherwise necessary to fulfill the purposes described above. </li>
                    </ul>

                    <h4 className='text-lg font-semibold'> Security of Personal Information</h4>
                    <p className='text-[15px] my-3 text-gray-500'>BOVA employs appropriate technical, physical, and administrative measures to protect your data against unauthorized access, use, or disclosure. While we strive to safeguard your information, no system is entirely secure. We encourage you to protect your account credentials and notify us immediately if you suspect unauthorized access to your information.</p>
                    <h4 className='text-lg font-semibold'> Data Retention</h4>

                    <p className='text-[15px] my-3 text-gray-500'>We retain your personal information as necessary to fulfill the purposes outlined in this Privacy Statement, comply with legal obligations, resolve disputes, and enforce agreements. Retention periods may vary based on the type of data and applicable laws.</p>

                    <h4 className='text-lg font-semibold'> Access and Accuracy of Personal Information</h4>
                    <p className='text-[15px] my-3 text-gray-500'>You can access, update, or correct your personal information through your BOVA account or by contacting us directly. We will respond to such requests in compliance with applicable laws.</p>

                    <h4 className='text-lg font-semibold'> Third-Party Links and Services</h4>
                    <p className='text-[15px] my-3 text-gray-500'>This Privacy Statement does not cover the practices of unaffiliated third parties or other websites linked from our Services. We encourage you to review the privacy policies of those third parties.</p>

                    <h4 className='text-lg font-semibold'> Updates to This Privacy Statement</h4>
                    <p className='text-[15px] my-3 text-gray-500'>We may update this Privacy Statement periodically to reflect changes in our practices or applicable laws. We will notify you of significant updates by posting a notice on our Services or contacting you directly.</p>
                    <h4 className='text-lg font-semibold'> Contact Us</h4>
                    <p className='text-[15px] my-3 text-gray-500'>If you have any questions about this Privacy Statement or our privacy practices, please contact us at:</p>


                    <h5 className='text-sm font-semibold'>BOVA</h5>
                    <p className='text-[15px]  text-gray-500'>support@bovalabs.com</p>
                    <p className='text-[15px]  text-gray-500'>1-213-224-1511</p>
                </div>
            </div>
        </AppLayout>

    );
}
