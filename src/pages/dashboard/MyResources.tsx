import { Search, Filter, Plus, MoreVertical, Eye, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect, useState } from 'react';
import { getMaterialsByUploader, getMaterialsByUploaderEmail } from '@/src/firebase/materials';
import { Material } from '@/src/types';

export function MyResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      if (user?.id) {
        try {
          // Try to fetch by ID first, then by email
          let materials = await getMaterialsByUploader(user.id);

          if (materials.length === 0 && user.email) {
            // Fallback to email-based query
            materials = await getMaterialsByUploaderEmail(user.email);
          }

          setResources(materials);
        } catch (error) {
          // Silently handle error
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResources();
  }, [user?.id, user?.email]);

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    if (status === 'APPROVED' || status === 'approved') return 'success';
    if (status === 'PENDING' || status === 'pending') return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Resources</h1>
          <p className="text-sm text-slate-500">Manage your study materials.</p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Upload
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 sm:py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xs:table-cell">Category</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-slate-500">
                      Loading your resources...
                    </td>
                  </tr>
                ) : filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-slate-500">
                      No resources found. Upload your first resource to get started!
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="bg-indigo-50 p-1.5 sm:p-2 rounded-lg shrink-0">
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{resource.title}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500">{resource.views || 0} views</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden xs:table-cell">
                        <span className="text-xs sm:text-sm text-slate-600">{resource.category}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Badge
                          variant={getStatusVariant(resource.status)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {resource.status}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <span className="text-xs sm:text-sm text-slate-600">{new Date(resource.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] sm:text-sm text-slate-500">{filteredResources.length} of {resources.length}</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs" disabled>Prev</Button>
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
