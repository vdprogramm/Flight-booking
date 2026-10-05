import { Mail, MapPin, Plane, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo footer-logo">
            <span className="logo-icon">
              <Plane size={22} />
            </span>

            <span>
              Sky<span>Booking</span>
            </span>
          </div>

          <p>
            Nền tảng đặt vé máy bay trực tuyến nhanh chóng,
            tiện lợi và an toàn cho mọi hành trình.
          </p>
        </div>

        <div>
          <h4>Khám phá</h4>
          <a href="/">Trang chủ</a>
          <a href="#features">Dịch vụ</a>
          <a href="#destinations">Điểm đến</a>
          <a href="#about">Giới thiệu</a>
        </div>

        <div>
          <h4>Hỗ trợ</h4>
          <a href="/">Điều khoản sử dụng</a>
          <a href="/">Chính sách bảo mật</a>
          <a href="/">Câu hỏi thường gặp</a>
        </div>

        <div>
          <h4>Liên hệ</h4>

          <p><MapPin size={16} /> Hà Nội, Việt Nam</p>
          <p><Phone size={16} /> 1900 1234</p>
          <p><Mail size={16} /> support@skybooking.vn</p>

          <div className="socials">
            <Facebook size={20} />
            <Instagram size={20} />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 SkyBooking. Flight Booking System.
      </div>
    </footer>
  );
}

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
