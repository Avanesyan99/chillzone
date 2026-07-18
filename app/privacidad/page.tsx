import { Shield, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 64, background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 720 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
          color: 'var(--text-muted)', fontSize: 11, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 36 }}>
          <ChevronLeft size={14}/> Volver
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <Shield size={30} color="var(--ember)"/>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(36px,6vw,56px)',
            letterSpacing: '0.06em', color: 'var(--text)' }}>
            POLÍTICA DE PRIVACIDAD
          </h1>
        </div>

        <Section title="Responsable del tratamiento">
          <p><strong>CHILLZONE — Outdoor &amp; Lifestyle Gear</strong><br/>
          Email de contacto: <a href="mailto:chillzonestore1@gmail.com" style={{ color: 'var(--ember)' }}>chillzonestore1@gmail.com</a><br/>
          Buenos Aires, Argentina</p>
        </Section>

        <Section title="Datos que recopilamos">
          <p>Al crear una cuenta recopilamos:</p>
          <ul style={{ marginTop: 8, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>Nombre y apellido</strong> — para personalizar tu experiencia y los pedidos.</li>
            <li><strong>Dirección de email</strong> — para la autenticación y comunicaciones de cuenta.</li>
            <li><strong>Número de teléfono</strong> (opcional) — para incluirlo en los pedidos por WhatsApp.</li>
            <li><strong>Contraseña</strong> — gestionada y almacenada de forma segura por Firebase Authentication (Google), nunca accesible en texto plano por CHILLZONE.</li>
          </ul>
        </Section>

        <Section title="Finalidad y base legal">
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>Gestión de cuenta y pedidos</strong> — Art. 6(1)(b) RGPD (ejecución de contrato).</li>
            <li><strong>Comunicaciones transaccionales</strong> — Art. 6(1)(b) RGPD.</li>
            <li><strong>Cookies de sesión</strong> — Art. 6(1)(b) RGPD (necesarias para el servicio).</li>
            <li><strong>Cookies funcionales opcionales</strong> — Art. 6(1)(a) RGPD (consentimiento).</li>
          </ul>
        </Section>

        <Section title="Almacenamiento y seguridad">
          Los datos se almacenan en <strong>Firebase</strong> (Google Cloud Platform): la información
          de cuenta y catálogo en Cloud Firestore, y las credenciales en Firebase Authentication.
          Las sesiones se gestionan mediante cookies de sesión firmadas por Firebase, almacenadas
          httpOnly, SameSite=Lax, con expiración de 7 días.
        </Section>

        <Section title="Subprocesadores">
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>Google LLC (Firebase)</strong> — base de datos (Cloud Firestore) y autenticación (Firebase Authentication)</li>
            <li><strong>Vercel Inc.</strong> — hosting de la aplicación y almacenamiento de imágenes (Vercel Blob)</li>
            <li><strong>WhatsApp (Meta)</strong> — canal de comunicación para pedidos (datos transmitidos voluntariamente por el usuario al hacer clic en "Pedir por WhatsApp")</li>
          </ul>
        </Section>

        <Section title="Retención de datos">
          Conservamos tus datos mientras tu cuenta esté activa. Podés solicitar la eliminación de
          tu cuenta y todos tus datos en cualquier momento escribiendo a{' '}
          <a href="mailto:chillzonestore1@gmail.com" style={{ color: 'var(--ember)' }}>chillzonestore1@gmail.com</a>.
          Los enlaces de restablecimiento de contraseña expiran automáticamente al ser usados o
          después de 1 hora.
        </Section>

        <Section title="Tus derechos">
          <p>Bajo el RGPD y la legislación aplicable, tenés derecho a:</p>
          <ul style={{ marginTop: 8, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>Acceder a tus datos personales</li>
            <li>Rectificar datos incorrectos</li>
            <li>Solicitar la supresión de tus datos</li>
            <li>Oponerte al tratamiento</li>
            <li>Solicitar la portabilidad de tus datos</li>
            <li>Retirar el consentimiento en cualquier momento (sin afectar el tratamiento previo)</li>
          </ul>
          <p style={{ marginTop: 10 }}>
            Para ejercer cualquiera de estos derechos, contactanos en{' '}
            <a href="mailto:chillzonestore1@gmail.com" style={{ color: 'var(--ember)' }}>chillzonestore1@gmail.com</a>.
          </p>
        </Section>

        <Section title="Cookies">
          Para información detallada sobre las cookies que usamos, consultá nuestra{' '}
          <Link href="/cookies" style={{ color: 'var(--ember)' }}>Política de Cookies</Link>.
        </Section>

        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.6 }}>
          Última actualización: {new Date().getFullYear()}. CHILLZONE — Outdoor & Lifestyle Gear.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
      <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '0.06em',
        color: 'var(--text)', marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}
