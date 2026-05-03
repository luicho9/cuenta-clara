const whatsappNumber =
  process.env.NEXT_PUBLIC_SUYAPA_WHATSAPP ?? "50400000000";
const confirmationPreviewText = [
  "✂️ Venta registrada",
  "3x corte $200 = $600",
  "Total: $600",
  "Hora: 14:23",
].join("\n");

const features = [
  {
    title: "Audio en español",
    body: "Mándale ventas, gastos e insumos como se dicen en la barbería, pulpería o tienda.",
  },
  {
    title: "Cierre diario automático",
    body: "A las 8pm Suyapa manda ventas, gastos, margen y número de movimientos del día.",
  },
  {
    title: "Reporte mensual",
    body: "Próximamente: cortes mensuales listos para contador, socios o decisiones rápidas.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f4eb] text-[#17211b]">
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">WhatsApp-native AI accountant</p>
          <h1>Suyapa — tu contadora en WhatsApp.</h1>
          <p className="subhead">Mándale un audio. Ella lleva tus cuentas.</p>
          <a
            className="cta"
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
          >
            Escríbele a Suyapa +504 {whatsappNumber.slice(-8)}
          </a>
        </div>

        <div
          className="phone-demo"
          role="img"
          aria-label="Demo de WhatsApp con Suyapa"
        >
          <div className="phone-top">
            <div>
              <span className="avatar">L</span>
              <strong>Suyapa</strong>
            </div>
            <span className="online">en línea</span>
          </div>
          <div className="chat-window">
            <div className="bubble voice">
              <span className="play">▶</span>
              <span className="wave" />
              <span>0:06</span>
            </div>
            <div className="bubble transcript">
              “Vendí 3 cortes a 200 cada uno”
            </div>
            <div className="card-preview">
              <pre>{confirmationPreviewText}</pre>
              <div className="card-actions">
                <span>Borrar</span>
                <span>Ver resumen</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-band" aria-label="Funciones">
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        Built for Vercel Zero to Agent hackathon, ChatSDK Agents track.
      </footer>
    </main>
  );
}
