import cover1 from '../assets/1.jpg';
export type Book = {
  id: string;
  title: string;
  author: string;
  cover: string; // URL รูปปก
};
export const books: Book[] = [
  { id: '1', title: 'เกียรติยศดวงดาว', author: 'วาดฝันแห่งรัก', cover: cover1 },
  { id: '2', title: 'รุ่งอรุณกิ่งฉัตร', author: 'กิ่งฉัตร', cover: cover1  },
  { id: '3', title: 'มีเพียงรักกิ่งฉัตร', author: 'กิ่งฉัตร', cover: cover1 },
  { id: '4', title: 'Visit SWISS เที่ยว...', author: 'อลิศศักดิ์', cover: cover1 },
  { id: '5', title: 'The Human Cosmos', author: 'Jo Marchant', cover: cover1 },
];