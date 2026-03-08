import * as React from 'react';
import { BarChart3, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-white mt-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">Studiy Admin</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Manage and moderate educational content on the Studiy platform.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Management */}
                    <div>
                        <h3 className="font-semibold mb-4">Management</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><Link to="/admin" className="hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link to="/admin/users" className="hover:text-white transition-colors">Manage Users</Link></li>
                            <li><Link to="/admin/resources" className="hover:text-white transition-colors">Manage Resources</Link></li>
                            <li><Link to="/admin/approvals" className="hover:text-white transition-colors">Approvals</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Admin Guide</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-800 pt-8">
                    {/* Bottom */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-slate-400 text-sm">
                            &copy; {currentYear} Studiy Admin Panel. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
