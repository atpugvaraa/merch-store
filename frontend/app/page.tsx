import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="flex h-screen flex-col justify-center">
        <nav className="flex items-center justify-evenly gap-300 border-2 border-gray-300 font-semibold shadow-md rounded-3xl mt-6 mx-40">
          <Link href="#" className="">
            Logo
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/cart" className="">
              Cart
            </Link>

            <div className="h-14 w-14 rounded-full border-2 border-gray-800">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </nav>

        <div className="mt-14 h-0.5 text-center text-4xl font-semibold">
          Winter Collection
        </div>

        <main className="mb-16 flex h-screen w-full items-center justify-center gap-8">
          <div className="h-[650px] w-[450px] rounded-2xl border-2 border-gray-300 shadow-lg">
            <img
              src="/product.png"
              alt="Product"
              className="h-[76%] w-full object-cover"
            />
            <div className="border-t-2 border-gray-300 p-7">description</div>
          </div>
          <div className="h-[650px] w-[450px] rounded-2xl border-2 border-gray-300 shadow-lg">
            <img
              src="/product.png"
              alt="Product"
              className="h-[76%] w-full object-cover"
            />
            <div className="border-t-2 border-gray-300 p-7">description</div>
          </div>
          <div className="h-[650px] w-[450px] rounded-2xl border-2 border-gray-300 shadow-lg">
            <img
              src="/product.png"
              alt="Product"
              className="h-[76%] w-full object-cover"
            />
            <div className="border-t-2 border-gray-300 p-7">description</div>
          </div>
        </main>
      </div>
    </>
  );
}