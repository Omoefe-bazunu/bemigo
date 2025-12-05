export default function ContactUs() {
  return (
    <section className="py-16 px-6 md:px-12 bg-white text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-6">
        Get in Touch
      </h2>
      <p className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
        Have questions or want to place an order? Reach out to us right away.
      </p>
      <div className="flex justify-center gap-4">
        <a
          href="mailto:raniem57@gmail.com"
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition"
        >
          Email Us
        </a>
        <a
          href="tel:+2349126939069"
          className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-lg transition"
        >
          Call Us
        </a>
      </div>
    </section>
  );
}
