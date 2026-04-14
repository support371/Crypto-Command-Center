import { useState } from "react";
import { useGetEducationTopics, useGetDefinitions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, ExternalLink, Search, Tag } from "lucide-react";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

const ALL_CATEGORIES = "All Topics";

export default function Education() {
  const { data: topics, isLoading: loadingTopics } = useGetEducationTopics();
  const { data: definitions, isLoading: loadingDefs } = useGetDefinitions({});
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [ALL_CATEGORIES, ...Array.from(new Set(topics?.map((t: any) => t.category) || []))];

  const filteredTopics = topics?.filter((t: any) => {
    const matchCat = activeCategory === ALL_CATEGORIES || t.category === activeCategory;
    const matchSearch = !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredDefs = definitions?.filter((d: any) =>
    !searchTerm || d.term.toLowerCase().includes(searchTerm.toLowerCase()) || d.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Education Centre</h1>
        <p className="text-sm text-muted-foreground">
          Concepts and definitions sourced via Investopedia · Educational content only, not investment advice
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search topics and definitions..."
          className="pl-9 bg-card"
        />
      </div>

      {/* Topics */}
      <div>
        {/* Category filter */}
        {!searchTerm && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loadingTopics ? (
          <div className="flex h-24 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics?.map((topic: any) => (
              <Card key={topic.id} className="border-border hover:border-primary/30 transition-colors group">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-snug">{topic.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="outline" className={`text-[10px] h-4 ${DIFFICULTY_COLORS[topic.difficulty]}`}>
                            {topic.difficulty}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />{topic.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={topic.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{topic.summary}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">via {topic.source}</span>
                    <a
                      href={topic.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-1"
                    >
                      Read more <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredTopics?.length === 0 && (
              <div className="col-span-2 text-center py-10 text-sm text-muted-foreground">No topics match your search</div>
            )}
          </div>
        )}
      </div>

      {/* Definitions Glossary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">NexusCore Glossary</CardTitle>
          <CardDescription className="text-xs">Platform-specific terms and their definitions · Powered by Investopedia</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDefs ? (
            <div className="flex h-24 items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {filteredDefs?.map((def: any) => (
                <div key={def.term} className="py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-primary">{def.term}</span>
                    <a
                      href={def.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      via {def.source} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{def.definition}</p>
                  {def.example && (
                    <div className="mt-2 p-2.5 rounded bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground italic">{def.example}</p>
                    </div>
                  )}
                  {def.relatedTerms?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-muted-foreground">Related:</span>
                      {def.relatedTerms.map((term: string) => (
                        <span key={term} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{term}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredDefs?.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">No definitions match your search</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
