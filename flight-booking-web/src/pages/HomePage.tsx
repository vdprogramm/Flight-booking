import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Headphones,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const destinations = [
  {
    city: "Hà Nội",
    code: "HAN",
    description: "Khám phá thủ đô nghìn năm văn hiến",
    className: "destination-hanoi",
  },
  {
    city: "TP. Hồ Chí Minh",
    code: "SGN",
    description: "Thành phố năng động và hiện đại",
    className: "destination-saigon",
  },
  {
    city: "Đà Nẵng",
    code: "DAD",
    description: "Biển xanh, nắng vàng và những cây cầu",
    className: "destination-danang",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-decoration hero-decoration-one" />
        <div className="hero-decoration hero-decoration-two" />

        <div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow">
              <Sparkles size={17} />
              Hành trình của bạn bắt đầu tại đây
            </div>

            <h1>
              Bay đến nơi bạn muốn,
              <span> dễ dàng hơn bao giờ hết.</span>
            </h1>

            <p>
              Tìm kiếm chuyến bay, lựa chọn ghế và hoàn tất
              đặt vé chỉ trong vài phút với SkyBooking.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Bắt đầu ngay
                <ArrowRight size={19} />
              </Link>

              <a href="#about" className="btn btn-white btn-large">
                Tìm hiểu thêm
              </a>
            </div>


          </div>

          <div className="hero-visual">
            <div className="flight-card">
              <div className="flight-card-header">
                <span>Chuyến bay nổi bật</span>
                <span className="flight-status">Đúng giờ</span>
              </div>

              <div className="flight-route">
                <div>
                  <strong>HAN</strong>
                  <span>Hà Nội</span>
                </div>

                <div className="route-line">
                  <span />
                  <Plane size={24} />
                  <span />
                </div>

                <div>
                  <strong>SGN</strong>
                  <span>TP. Hồ Chí Minh</span>
                </div>
              </div>

              <div className="flight-info">
                <div>
                  <span>Khởi hành</span>
                  <strong>08:00</strong>
                </div>

                <div>
                  <span>Thời gian</span>
                  <strong>2h 10m</strong>
                </div>

                <div>
                  <span>Máy bay</span>
                  <strong>A321</strong>
                </div>
              </div>

              <div className="fake-ticket">
                <span>
                  <Plane size={17} />
                  SkyBooking
                </span>
                <span>VN • Domestic</span>
              </div>
            </div>

            <div className="floating-card floating-price">
              <BadgeCheck size={21} />
              <div>
                <span>Giá tốt</span>
                <strong>Tìm kiếm dễ dàng</strong>
              </div>
            </div>

            <div className="floating-card floating-secure">
              <ShieldCheck size={21} />
              <div>
                <span>An toàn</span>
                <strong>Đặt vé bảo mật</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-heading">
            <span>TẠI SAO CHỌN SKYBOOKING?</span>
            <h2>Đặt chuyến bay đơn giản hơn</h2>
            <p>
              Mọi thứ bạn cần cho hành trình được tập trung
              trong một trải nghiệm đặt vé thuận tiện.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">
                <Search />
              </div>
              <h3>Tìm kiếm nhanh</h3>
              <p>
                Tìm chuyến bay phù hợp theo điểm đi,
                điểm đến và ngày khởi hành.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <Clock3 />
              </div>
              <h3>Giữ ghế tiện lợi</h3>
              <p>
                Ghế được giữ tạm thời trong quá trình hoàn
                tất thông tin và thanh toán.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <ShieldCheck />
              </div>
              <h3>An toàn & bảo mật</h3>
              <p>
                Tài khoản và quy trình đặt vé được bảo vệ
                bởi hệ thống xác thực an toàn.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <Headphones />
              </div>
              <h3>Hỗ trợ 24/7</h3>
              <p>
                Theo dõi booking và nhận hỗ trợ cho hành
                trình bất cứ khi nào bạn cần.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section destination-section" id="destinations">
        <div className="container">
          <div className="section-heading">
            <span>KHÁM PHÁ VIỆT NAM</span>
            <h2>Điểm đến phổ biến</h2>
            <p>
              Một vài hành trình nổi bật để bắt đầu chuyến đi tiếp theo.
            </p>
          </div>

          <div className="destination-grid">
            {destinations.map((item) => (
              <article
                className={`destination-card ${item.className}`}
                key={item.code}
              >
                <div className="destination-overlay" />

                <div className="destination-content">
                  <span className="destination-code">
                    <MapPin size={15} />
                    {item.code}
                  </span>

                  <h3>{item.city}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="container about-grid">
          <div className="about-visual">
            <img 
              src="/images/about-visual.jpg" 
              alt="SkyBooking travel experience" 
            />
          </div>

          <div className="about-content">
            <span className="section-label">VỀ SKYBOOKING</span>

            <h2>Một nền tảng cho toàn bộ hành trình</h2>

            <p>
              SkyBooking được xây dựng để giúp quá trình tìm
              kiếm và đặt vé máy bay trở nên rõ ràng, nhanh
              chóng và thuận tiện.
            </p>

            <p>
              Người dùng có thể tìm chuyến bay, lựa chọn ghế,
              nhập thông tin hành khách, thanh toán và quản lý
              booking trên cùng một hệ thống.
            </p>

            <Link to="/register" className="btn btn-primary btn-large">
              Tạo tài khoản
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <div>
            <span>SẴN SÀNG CẤT CÁNH?</span>
            <h2>Bắt đầu hành trình tiếp theo của bạn.</h2>
          </div>

          <div className="cta-actions">
            <Link to="/register" className="btn btn-white btn-large">
              Đăng ký miễn phí
            </Link>

            <Link to="/login" className="cta-login">
              Tôi đã có tài khoản →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
