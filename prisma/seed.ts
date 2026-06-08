import bcrypt from "bcryptjs";
import { PrismaClient, PublishStatus } from "@prisma/client";
import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

const categories = ["Áo", "Mũ", "Phụ kiện", "Bookmark", "Tranh", "Khác"];

const authors = [
  {
    name: "Kiều Đức Lâm",
    subtitle: "Nghệ sĩ Kim hoàn & Đồng sáng lập Artdict",
    style: "Nghệ thuật Kim hoàn",
    portraitSrc: "/artdictor/705325896_1167896908801291_6802666704949378051_n.png",
    bio: "Kiều Đức Lâm theo đuổi chế tác thủ công và triết lý tôn vinh sự không hoàn hảo."
  },
  {
    name: "Nguyễn Hoàng Mai Linh",
    subtitle: "Nhà thiết kế đồ họa và streetwear",
    style: "Thiết kế Đồ họa & Streetwear",
    portraitSrc: "/artdictor/3.png",
    bio: "Mai Linh phát triển các sản phẩm thị giác dành cho người trẻ yêu nghệ thuật ứng dụng."
  }
];

const products = [
  {
    name: "Áo Đồ Để Chơi Chất Để Đời",
    category: "Áo",
    price: 350000,
    stock: 50,
    description: "Áo thun streetwear cotton 100% với thiết kế giới hạn.",
    story: "Thiết kế mang tinh thần vui, chất, và có câu chuyện riêng của Artdict.",
    images: ["/assets/Áo Đồ để chơi Chất để đời 1.png", "/assets/Sổ tay.png"]
  },
  {
    name: "Áo Thun Mèo Nổ V1",
    category: "Áo",
    price: 320000,
    stock: 32,
    description: "Áo thun graphic playful dành cho bộ sưu tập đầu tiên.",
    story: "Một sản phẩm thể hiện chất vui và cá tính thị giác của studio.",
    images: ["/assets/Áo Mèo Nổ 1.png"]
  },
  {
    name: "Mũ Đồ Để Chơi Đen",
    category: "Mũ",
    price: 250000,
    stock: 24,
    description: "Mũ thiết kế tối giản với tinh thần Artdict.",
    story: "Phụ kiện gọn, dễ phối, dành cho người sưu tập sản phẩm nghệ thuật thường ngày.",
    images: ["/assets/Mũ Đồ để chơi Chất để đời 1.png"]
  }
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@artdict.local";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Artdict Admin" }
  });

  for (const [index, name] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name, sortOrder: index },
      create: { name, slug: slugify(name), sortOrder: index }
    });
  }

  const seededAuthors = [];
  for (const author of authors) {
    seededAuthors.push(
      await prisma.author.upsert({
        where: { slug: slugify(author.name) },
        update: { ...author, status: PublishStatus.published },
        create: { ...author, slug: slugify(author.name), status: PublishStatus.published }
      })
    );
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: slugify(product.category) } });
    await prisma.product.upsert({
      where: { slug: slugify(product.name) },
      update: {
        name: product.name,
        description: product.description,
        story: product.story,
        price: product.price,
        stock: product.stock,
        status: PublishStatus.published,
        categoryId: category.id,
        authorId: seededAuthors[0]?.id,
        images: {
          deleteMany: {},
          create: product.images.map((src, sortOrder) => ({ src, sortOrder, alt: product.name }))
        }
      },
      create: {
        name: product.name,
        slug: slugify(product.name),
        description: product.description,
        story: product.story,
        price: product.price,
        stock: product.stock,
        status: PublishStatus.published,
        categoryId: category.id,
        authorId: seededAuthors[0]?.id,
        images: {
          create: product.images.map((src, sortOrder) => ({ src, sortOrder, alt: product.name }))
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
