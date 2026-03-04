
export const title = "Ana Sayfa";
export const description = "Mini Next'e Hoş Geldiniz! Bu sayfa Bun ile SSR (Server Side Rendering) yapılmıştır.";

export default function Index() {
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">Mini Next'e Hoş Geldiniz!</h1>
            <p>Bu sayfa Bun ile SSR (Server Side Rendering) yapılmıştır.</p>
            <a href="/about" className="text-blue-500 underline">Hakkımızda</a>
        </div>
    );
}