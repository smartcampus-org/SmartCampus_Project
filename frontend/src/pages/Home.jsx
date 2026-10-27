import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    // Si déjà connecté → dashboard
    const token = localStorage.getItem('token')
    if (token) navigate('/dashboard')
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navbar */}
      <nav style={{
        padding: '0 40px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>SmartCampus</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 8,
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Connexion
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '8px 20px',
              background: 'white',
              border: 'none',
              borderRadius: 8,
              color: '#7c3aed',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            S'inscrire
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px'
      }}>
        <div style={{
          fontSize: 72,
          marginBottom: 24,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        }}>🎓</div>

        <h1 style={{
          fontSize: 52,
          fontWeight: 800,
          color: 'white',
          marginBottom: 16,
          lineHeight: 1.2
        }}>
          Bienvenue sur<br />
          <span style={{ color: '#fbbf24' }}>SmartCampus</span>
        </h1>

        <p style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.85)',
          maxWidth: 520,
          lineHeight: 1.7,
          marginBottom: 40
        }}>
          La plateforme de gestion universitaire intelligente.
          Connectez-vous avec votre e-mail institutionnel pour accéder
          à tous vos services campus.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 36px',
              background: 'white',
              border: 'none',
              borderRadius: 12,
              color: '#7c3aed',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
          >
            Se connecter →
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '14px 36px',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: 12,
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
          >
            Créer un compte
          </button>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginTop: 64,
          maxWidth: 700,
          width: '100%'
        }}>
          {[
            { icon: '🔐', title: 'Sécurisé', desc: 'Authentification JWT & BCrypt' },
            { icon: '👥', title: 'Multi-rôles', desc: 'Étudiant, Personnel, Admin' },
            { icon: '📧', title: 'Institutionnel', desc: 'E-mail @smartcampus.ma' }
          ].map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: 12,
              padding: '20px 16px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
