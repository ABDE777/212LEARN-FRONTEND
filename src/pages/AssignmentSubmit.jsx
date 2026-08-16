import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAssignmentSubmissions } from '../hooks/useProgress';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AssignmentSubmit() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { submitAssignment, loading: submitting, error: submitError } = useAssignmentSubmissions();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockAssignment = {
          _id: assignmentId,
          title: 'Devoir: Implémentation d\'un algorithme de tri',
          description: 'Implémentez l\'algorithme de tri rapide (QuickSort) dans le langage de votre choix. Votre code doit être bien commenté et suivre les bonnes pratiques de programmation.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          maxScore: 100,
          instructions: [
            'Soumettez votre code dans un fichier .zip ou .pdf',
            'Incluez des commentaires expliquant votre approche',
            'Assurez-vous que votre code compile et s\'exécute correctement',
            'La complexité temporelle doit être O(n log n) en moyenne'
          ],
          allowedFormats: ['.zip', '.pdf', '.docx', '.txt'],
          maxSize: 10 // MB
        };
        
        setAssignment(mockAssignment);
      } catch (err) {
        setError(err.message || 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file size
    if (file.size > assignment.maxSize * 1024 * 1024) {
      alert(`Le fichier dépasse la taille maximale de ${assignment.maxSize}MB`);
      return;
    }

    // Validate file format
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!assignment.allowedFormats.includes(fileExtension)) {
      alert(`Format non autorisé. Formats acceptés: ${assignment.allowedFormats.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    try {
      const result = await submitAssignment(assignmentId, selectedFile);
      setSubmissionResult(result);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit assignment:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = new Date() > new Date(assignment?.dueDate);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--error-color)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>
          <Button variant="outline" onClick={() => navigate(`/learn/${courseId}/lesson/intro`)}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p>Devoir non trouvé</p>
          <Button variant="outline" onClick={() => navigate(`/learn/${courseId}/lesson/intro`)}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Card variant="default" padding="3rem" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%',
              background: 'var(--success-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <CheckCircle size={64} color="#fff" />
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--success-color)' }}>
              Devoir soumis avec succès !
            </h1>
            
            <p style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '2rem' }}>
              Votre devoir a été envoyé et sera évalué par votre instructeur.
            </p>

            <div style={{ 
              padding: '1.5rem', 
              background: 'var(--bg-color)', 
              borderRadius: '8px',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Détails de la soumission</h3>
              <div style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                <strong>Fichier:</strong> {filePreview?.name}
              </div>
              <div style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                <strong>Taille:</strong> {filePreview?.size}
              </div>
              <div style={{ color: 'var(--text-color)' }}>
                <strong>Date de soumission:</strong> {formatDate(new Date().toISOString())}
              </div>
            </div>

            <Button 
              variant="primary"
              size="large"
              onClick={() => navigate(`/learn/${courseId}/lesson/intro`)}
            >
              Retour au cours
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            to={`/learn/${courseId}/lesson/intro`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--secondary)', 
              textDecoration: 'none',
              marginBottom: '1rem'
            }}
          >
            <ChevronLeft size={20} />
            Retour au cours
          </Link>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
            {assignment.title}
          </h1>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--secondary)' }}>
            <span style={{ color: isOverdue ? 'var(--error-color)' : 'inherit' }}>
              <strong>Date limite:</strong> {formatDate(assignment.dueDate)}
              {isOverdue && ' (En retard)'}
            </span>
            <span><strong>Note maximale:</strong> {assignment.maxScore} points</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          {/* Left: Assignment Details */}
          <div>
            <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Description</h2>
              <p style={{ color: 'var(--text-color)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {assignment.description}
              </p>

              <h3 style={{ marginBottom: '0.75rem', color: 'var(--secondary)' }}>Instructions</h3>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-color)', lineHeight: 1.8 }}>
                {assignment.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </Card>

            <Card variant="default" padding="1.5rem">
              <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Formats acceptés</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {assignment.allowedFormats.map((format) => (
                  <span 
                    key={format}
                    style={{ 
                      background: 'var(--bg-color)', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      color: 'var(--secondary)'
                    }}
                  >
                    {format}
                  </span>
                ))}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                Taille maximale: {assignment.maxSize}MB
              </p>
            </Card>
          </div>

          {/* Right: File Upload */}
          <div>
            <Card variant="elevated" padding="2rem" style={{ position: 'sticky', top: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                Soumettre votre devoir
              </h2>

              {filePreview ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ 
                    padding: '1.5rem', 
                    background: 'var(--bg-color)', 
                    borderRadius: '12px',
                    border: '2px solid var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <FileText size={32} color="var(--primary)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.25rem' }}>
                        {filePreview.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                        {filePreview.size}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: 'var(--error-color)',
                        padding: '0.5rem'
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    background: dragActive ? 'var(--bg-color)' : 'var(--surface-color)',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <Upload size={48} color={dragActive ? 'var(--primary)' : 'var(--secondary)'} style={{ marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {dragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier ici'}
                  </p>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                    ou cliquez pour sélectionner
                  </p>
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept={assignment.allowedFormats.join(',')}
                  />
                </div>
              )}

              <Button
                variant="primary"
                size="large"
                style={{ width: '100%' }}
                onClick={handleSubmit}
                disabled={!selectedFile || submitting}
                loading={submitting}
              >
                {submitting ? 'Soumission en cours...' : 'Soumettre le devoir'}
              </Button>

              {submitError && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: '#fee', 
                  border: '1px solid #fcc', 
                  borderRadius: '8px',
                  color: '#c33',
                  fontSize: '0.9rem'
                }}>
                  {submitError}
                </div>
              )}

              {isOverdue && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: '#fff3cd', 
                  border: '1px solid #ffc107', 
                  borderRadius: '8px',
                  color: '#856404',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  Ce devoir est en retard. Vous pouvez toujours le soumettre, mais des pénalités peuvent s'appliquer.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
