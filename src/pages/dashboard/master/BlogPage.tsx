import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext";

const BlogPage = () => {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, isLoading } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<typeof blogPosts[0] | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    content: "",
    imageUrl: "",
    tags: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.id]: e.target.value });
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formState.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    if (currentPost) {
      try {
        await updateBlogPost(currentPost.id, { ...formState, tags: tagsArray });
        setIsModalOpen(false);
        setFormState({ title: "", content: "", imageUrl: "", tags: "" });
        setCurrentPost(null);
      } catch (error: any) {
        toast.error(error.message || "Erro ao atualizar post.");
      }
    } else {
      try {
        await addBlogPost({ ...formState, tags: tagsArray });
        setIsModalOpen(false);
        setFormState({ title: "", content: "", imageUrl: "", tags: "" });
      } catch (error: any) {
        toast.error(error.message || "Erro ao criar post.");
      }
    }
  };

  const handleEditPost = (post: typeof blogPosts[0]) => {
    setCurrentPost(post);
    setFormState({ title: post.title, content: post.content, imageUrl: post.imageUrl || "", tags: post.tags.join(', ') });
    setIsModalOpen(true);
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deleteBlogPost(id);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir post.");
    }
  };

  const handleOpenNewPostModal = () => {
    setCurrentPost(null);
    setFormState({ title: "", content: "", imageUrl: "", tags: "" });
    setIsModalOpen(true);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Gestão de Blog</h1>
        <Button size="sm" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20 uppercase" onClick={handleOpenNewPostModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Post
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <motion.div
            key={post.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
          >
            <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col hover:border-primary hover:scale-[1.02] transition-all duration-300 ease-out">
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover rounded-t-2xl" />
              )}
              <CardHeader className="flex-1">
                <CardTitle className="text-foreground text-xl">{post.title}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Por {post.author} em {post.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground text-sm line-clamp-3">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-4 border-t border-border/50">
                <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => handleEditPost(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" className="hover:bg-destructive/80" onClick={() => handleDeletePost(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">{currentPost ? "Editar Post" : "Criar Novo Post"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {currentPost ? "Faça alterações no post existente." : "Preencha os detalhes para criar um novo post."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePost} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-foreground">
                Título
              </Label>
              <Input
                id="title"
                value={formState.title}
                onChange={handleInputChange}
                className="col-span-3 bg-background border-border text-foreground focus:ring-primary"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right text-foreground">
                Conteúdo
              </Label>
              <Textarea
                id="content"
                value={formState.content}
                onChange={handleInputChange}
                className="col-span-3 bg-background border-border text-foreground focus:ring-primary min-h-[100px]"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right text-foreground">
                URL da Imagem
              </Label>
              <Input
                id="imageUrl"
                value={formState.imageUrl}
                onChange={handleInputChange}
                className="col-span-3 bg-background border-border text-foreground focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right text-foreground">
                Tags (separadas por vírgula)
              </Label>
              <Input
                id="tags"
                value={formState.tags}
                onChange={handleInputChange}
                className="col-span-3 bg-background border-border text-foreground focus:ring-primary"
              />
            </div>
          </form>
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button type="submit" onClick={handleSavePost} disabled={isLoading} className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
              {isLoading ? "Salvando..." : currentPost ? "Salvar Alterações" : "Criar Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MasterDashboardLayout>
  );
};

export default BlogPage;