import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const faqs = [
  {
    question: "Apakah VOID gratis?",
    answer:
      "Ya, VOID sepenuhnya gratis. Tidak ada biaya, tidak ada login, tidak ada batas download."
  },
  {
    question: "Platform apa saja yang didukung?",
    answer:
      "Saat ini VOID mendukung TikTok (video dan slideshow) dan Instagram (Reels, Post, Story)."
  },
  {
    question: "Kenapa beberapa audio tidak tersedia?",
    answer:
      "Beberapa video TikTok menggunakan audio yang dilindungi hak cipta. Jika audio tidak tersedia, hanya video tanpa suara yang bisa didownload."
  },
  {
    question: "Kenapa Instagram butuh proses lebih lama?",
    answer:
      "Konten Instagram diproses melalui backend menggunakan autentikasi yang aman. Proses ini sedikit lebih lama tapi lebih andal."
  },
  {
    question: "Apakah link yang saya masukkan disimpan?",
    answer:
      "Tidak. Link hanya digunakan untuk mengambil metadata dan media, lalu langsung dibuang."
  },
  {
    question: "Kenapa video tertentu gagal diunduh?",
    answer:
      "Beberapa konten private, konten yang sudah dihapus, atau konten dengan pembatasan platform tidak bisa diambil."
  }
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className={isOpen ? "faq-item is-open" : "faq-item"}>
      <button
        className="faq-question"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{faq.question}</span>
        {isOpen ? (
          <Minus size={20} strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
        )}
      </button>

      {isOpen ? <p className="faq-answer">{faq.answer}</p> : null}
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  function toggle(index) {
    setOpenIndex((current) => (current === index ? -1 : index));
  }

  return (
    <section className="section bg-ink" aria-label="Pertanyaan umum">
      <div className="section-inner faq-inner">
        <span className="section-label faq-label">FAQ</span>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <FaqItem
              key={faq.question}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
