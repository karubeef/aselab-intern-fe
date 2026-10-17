import { useNavigate } from "react-router-dom";
import { createInformasi } from "../../api/informasi";
import ArticleForm from "../../components/ArticleForm";
import { formatLongDate } from "../../utils/articleFormat";

export default function AdminArticleCreate() {
  const navigate = useNavigate();

  async function handleSave(values) {
    await createInformasi(values);

    navigate("/admin/articles", {
      state: {
        notice: {
          type: "success",
          title: "Artikel berhasil ditambahkan",
          message: "Artikel edukasi telah disimpan dan tersedia untuk dibaca pengguna.",
        },
      },
    });
  }

  return (
    <ArticleForm
      mode="create"
      initial={{ title: "", content: "", coverImageUrl: "" }}
      previewDate={formatLongDate(new Date())}
      onSave={handleSave}
    />
  );
}