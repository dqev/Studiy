import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export function TermsOfService() {
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
                <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">Terms of Service</h1>
                        <p className="text-slate-600">Last updated: March 2026</p>
                    </div>

                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Studiy ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">2. Use License</h2>
                            <p>
                                Permission is granted to temporarily download one copy of the materials (information or software) on Studiy for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Modifying or copying the materials</li>
                                <li>Using the materials for any commercial purpose or for any public display</li>
                                <li>Attempting to decompile or reverse engineer any software contained on the Service</li>
                                <li>Removing any copyright or other proprietary notations from the materials</li>
                                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                                <li>Uploading or transmitting viruses or any other malicious code</li>
                                <li>Engaging in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">3. Disclaimer</h2>
                            <p>
                                The materials on Studiy are provided on an 'as is' basis. Studiy makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4. Limitations</h2>
                            <p>
                                In no event shall Studiy or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Studiy, even if Studiy or an authorized representative has been notified orally or in writing of the possibility of such damage.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">5. Accuracy of Materials</h2>
                            <p>
                                The materials appearing on Studiy could include technical, typographical, or photographic errors. Studiy does not warrant that any of the materials on the Service are accurate, complete, or current. Studiy may make changes to the materials contained on the Service at any time without notice.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">6. Links</h2>
                            <p>
                                Studiy has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Studiy of the site. Use of any such linked website is at the user's own risk.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">7. Modifications</h2>
                            <p>
                                Studiy may revise these terms of service for the Service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">8. Governing Law</h2>
                            <p>
                                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Studiy operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">9. User Generated Content</h2>
                            <p>
                                You are responsible for the content you upload to Studiy. By uploading content, you grant Studiy a non-exclusive, royalty-free, perpetual license to use, modify, and distribute your content. You warrant that you own or have obtained all necessary permissions for the content you upload.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">10. Prohibited Conduct</h2>
                            <p>
                                Users agree not to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Upload or share content that violates intellectual property rights</li>
                                <li>Engage in harassment, bullying, or abusive behavior</li>
                                <li>Spam or promote commercial services without authorization</li>
                                <li>Attempt to gain unauthorized access to the Service</li>
                                <li>Engage in any illegal activities through the Service</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">11. Account Termination</h2>
                            <p>
                                Studiy reserves the right to terminate any account that violates these Terms of Service or engages in prohibited conduct. Users can also delete their account at any time through their account settings.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">12. Contact Information</h2>
                            <p>
                                If you have any questions about these Terms of Service, please contact us at support@studiy.com
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
