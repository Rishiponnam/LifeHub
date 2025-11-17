export default function Footer() {
  return (
    <footer style={{
      background: '#111', color: '#555', textAlign: 'center',
      padding: '30px', borderTop: '1px solid #333', fontSize: '0.9rem'
    }}>
      <p>&copy; {new Date().getFullYear()} LifeHub. All rights reserved.</p>
      <p>Your daily wellness optimizer.</p>
    </footer>
  );
}