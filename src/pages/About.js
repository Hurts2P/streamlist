function About() {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>About Us</h1>
        <p style={styles.text}>Coming in Week 5!</p>
      </div>
    );
  }
  
  const styles = {
    container: {
      padding: '2rem',
      textAlign: 'center'
    },
    title: {
      color: '#e50914'
    },
    text: {
      color: '#666'
    }
  };
  
  export default About;