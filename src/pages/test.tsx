export const title = "Test Sayfası";
export const description = "Bu sayfa VN Framework'ün test sayfasıdır.";

export default function TestPage() {
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">Test Sayfası</h1>
            <p>Bu, VN Framework'ün test sayfasıdırrrrrrrrr.</p>
            <a href="/" className="text-blue-500 underline">Ana Sayfa</a>
        </div>
    );
}

