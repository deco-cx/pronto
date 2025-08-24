import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Clock, Search, Trash2, FileText, Eye } from "lucide-react";
import { useListIdeas, useDeleteIdea } from "../hooks/useIdeas";
import { Button } from "../components/ui/button";

function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: ideasData, isLoading } = useListIdeas(page, 12);
  const deleteIdea = useDeleteIdea();

  const handleBack = () => {
    navigate({ to: "/" });
  };

  const handleView = (id: string) => {
    navigate({ to: `/expand/${id}` });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this idea?")) {
      await deleteIdea.mutateAsync({ id });
    }
  };

  const filteredIdeas = ideasData?.ideas?.filter(idea =>
    idea.originalPrompt.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Idea History</h1>
                <p className="text-gray-600">
                  {ideasData?.total ? `${ideasData.total} ideas` : "No ideas yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {search ? "No ideas found" : "No ideas yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {search 
                ? `No ideas match "${search}". Try a different search term.`
                : "Start by creating your first idea on the home page."
              }
            </p>
            {!search && (
              <Button onClick={handleBack}>
                Create Your First Idea
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <p className="text-gray-800 text-sm line-clamp-3 flex-1">
                      {idea.originalPrompt}
                    </p>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      disabled={deleteIdea.isPending}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Delete idea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock className="w-3 h-3" />
                    {new Date(idea.createdAt).toLocaleDateString()}
                    {idea.hasExpandedData && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-auto">
                        Expanded
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleView(idea.id)}
                      className="flex items-center gap-1 flex-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {ideasData && ideasData.total > 12 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-gray-600">
                  Page {page} of {Math.ceil(ideasData.total / 12)}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil(ideasData.total / 12)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/history",
    component: HistoryPage,
    getParentRoute: () => parentRoute,
  });