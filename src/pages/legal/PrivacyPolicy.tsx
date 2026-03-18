import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <nav className="bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-70 transition-opacity">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                        <span className="text-slate-600 font-medium">Back</span>
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="bg-white rounded-2xl  p-6 sm:p-8 lg:p-12 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">Privacy Policy</h1>
                        <p className="text-slate-600">Last updated: March 2026</p>
                    </div>

                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">1. Introduction</h2>
                            <p>
                                Studiy ("we", "us", "our", or "Company") operates the Studiy website and mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">2. Information Collection and Use</h2>
                            <p>
                                We collect several different types of information for various purposes to provide and improve our Service to you.
                            </p>
                            <h3 className="font-semibold text-slate-900 mt-4">Types of Data Collected:</h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Personal Data:</strong> Email address, username, display name, phone number, bio, profile information</li>
                                <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, time and date of visits, time spent on pages</li>
                                <li><strong>Content Data:</strong> Study materials, notes, and resources you upload</li>
                                <li><strong>Device Data:</strong> Device type, operating system, unique device identifiers</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">3. Use of Data</h2>
                            <p>
                                Studiy uses the collected data for various purposes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>To provide and maintain our Service</li>
                                <li>To notify you about changes to our Service</li>
                                <li>To allow you to participate in interactive features of our Service</li>
                                <li>To provide customer support and respond to inquiries</li>
                                <li>To gather analysis or valuable information to improve our Service</li>
                                <li>To monitor the usage of our Service</li>
                                <li>To detect, prevent and address technical and security issues</li>
                                <li>To send you promotional emails (with your consent)</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4. Security of Data</h2>
                            <p>
                                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                            </p>
                            <p>
                                We implement industry-standard encryption, secure password storage, and regular security audits to protect your information.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">5. Service Providers</h2>
                            <p>
                                We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
                            </p>
                            <p>
                                These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">6. Links to Other Sites</h2>
                            <p>
                                Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                            </p>
                            <p>
                                We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">7. Children's Privacy</h2>
                            <p>
                                Our Service does not address anyone under the age of 13 ("Children"). We do not knowingly collect personally identifiable information from children under 13. If we become aware that a child under 13 has provided us with Personal Data, we immediately delete such information from our servers.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">8. Changes to This Privacy Policy</h2>
                            <p>
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">9. Your Rights</h2>
                            <p>
                                Depending on your location, you may have certain rights regarding your personal data:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Right to access your personal data</li>
                                <li>Right to correct inaccurate data</li>
                                <li>Right to delete your data</li>
                                <li>Right to restrict processing</li>
                                <li>Right to data portability</li>
                                <li>Right to withdraw consent</li>
                            </ul>
                            <p className="mt-4">
                                To exercise any of these rights, please contact us at privacy@studiy.com
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">10. Cookies</h2>
                            <p>
                                We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">11. Data Retention</h2>
                            <p>
                                We will retain your Personal Data only for as long as necessary to provide our Service. You can request deletion of your account and associated data at any time through your account settings. Some data may be retained for legal or operational purposes.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">12. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <p className="mt-2">
                                Email: privacy@studiy.com<br />
                                Website: studiy.com
                            </p>
                        </section>
                    </div>

                    <div className="pt-6 border-t border-[#E5E7EB]">
                        <Link to="/">
                            <Button className="rounded-xl">Return to Home</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
