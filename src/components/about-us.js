import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="py-16 px-6 md:px-20 bg-gray-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-stretch md:space-x-10">
        {/* Left text section */}
        <div className="flex flex-col md:w-1/2 space-y-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
              About Us
            </h2>
            <hr className="w-10 h-0.5 bg-orange-600 text-orange-600" />
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
            Bemigo Enterprises is your one-stop destination for quality and
            affordable essentials, operating a variety-based business that
            proudly serves customers{" "}
            <span className="text-orange-600 italic">globally</span> from its
            physical roots in Delta State, Nigeria.
          </p>
          <div className=" pt-4 border-t border-gray-300 dark:border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
              Our Leadership & Vision
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Bemigo Enterprises was founded and is currently led by the astute
              business lady,{" "}
              <span className="font-medium">
                Miss Jennifer Bemigo Ajemigbitse.{" "}
              </span>
              Her vision drives our mission: to bring joy and satisfaction to
              every customer interaction, ensuring that every product meets our
              high standards of excellence and affordability.
            </p>
          </div>
        </div>

        {/* Right image section */}
        <div className="relative h-100 mt-10 md:mt-0 w-full md:w-1/2 overflow-hidden rounded-lg">
          <Image
            src={"/about.jpg"}
            alt={"About Us"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="rounded-t-lg border-b-8 border-b-blue-600 transition duration-300 group-hover:scale-105 object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
