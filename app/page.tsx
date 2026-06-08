import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";

const collageImages = [
  { src: "/assets/12.png", alt: "Sản phẩm 12", className: "card-1", id: "card-art-1" },
  { src: "/assets/13.png", alt: "Sản phẩm 13", className: "card-2", id: "card-art-2" },
  { src: "/assets/14.png", alt: "Sản phẩm 14", className: "card-3", id: "card-art-3" },
  { src: "/assets/Áo Đồ để chơi Chất để đời 1.png", alt: "Áo Đồ để chơi Chất để đời", className: "card-4", id: "card-art-4" },
  { src: "/assets/Áo Mèo Nổ 1.png", alt: "Áo Mèo Nổ 1", className: "card-5", id: "card-art-5" },
  { src: "/assets/Áo Mèo Nổ 2.png", alt: "Áo Mèo Nổ 2", className: "card-6", id: "card-art-6" },
  { src: "/assets/Mũ Đồ để chơi Chất để đời 1 Xanh.png", alt: "Mũ Đồ để chơi Chất để đời 1 Xanh", className: "card-7", id: "card-art-7" },
  { src: "/assets/Mũ Đồ để chơi Chất để đời 1.png", alt: "Mũ Đồ để chơi Chất để đời 1", className: "card-8", id: "card-art-8" }
];

export default function HomePage() {
  return (
    <main>
      <section className="hero" id="hero-sec">
        <div className="hero-slideshow" id="hero-slideshow">
          <div className="slide slide-active" id="slide-1">
            <Image src="/assets/Screenshot 2026-05-20 154535.png" alt="Artdict showcase" fill priority />
          </div>
        </div>

        <div className="hero-collage" id="collage-grid">
          {collageImages.map((image) => (
            <div key={image.id} className={`collage-card ${image.className}`} id={image.id}>
              <Image src={image.src} alt={image.alt} width={520} height={520} />
            </div>
          ))}
        </div>

        <div className="hero-scroll-title" id="scroll-title-container">
          <div className="scroll-line scroll-line-1" id="scroll-text-l1">
            Đồ để chơi!
          </div>
          <div className="scroll-line scroll-line-2" id="scroll-text-l2">
            Chất để đời!
          </div>
        </div>
      </section>

      <div className="hero-spacer" id="hero-spacer" />

      <section className="manifesto bg-dark-section" id="manifesto-sec">
        <Reveal className="manifesto-container reveal-section">
          <span className="manifesto-badge">Lý do hình thành</span>
          <h1 className="manifesto-title" id="main-manifesto-heading">
            Nơi <span className="empathy">Nghệ thuật</span> hòa quyện cùng <span>Đam mê</span>
          </h1>
          <p className="manifesto-desc" id="manifesto-description">
            <strong>ARTDICT</strong> hỗ trợ các nhà thiết kế trẻ thương mại hóa tác phẩm thành sản phẩm vật lý có câu
            chuyện, chất lượng và dấu ấn cá nhân.
          </p>
          <Link className="btn-circle" href="/catalogue">
            <span>Khám phá sản phẩm</span>
            <span className="arrow-circle">→</span>
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
