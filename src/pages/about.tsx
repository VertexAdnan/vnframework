export const title = "Hakkımızda";
export const description = "Bu sayfa hakkında bilgiler içermektedir.";

export default function About() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Hakkımızda</h1>
      <p>Bu sayfa Bun ile SSR (Server Side Rendering) yapılmıştır.</p>
      <p>Hot reload test</p>
      <a href="/" className="text-blue-500 underline">Ana Sayfa</a>
    </div>
  );
}