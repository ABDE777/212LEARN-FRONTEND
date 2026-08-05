import { useEffect } from 'react';

export default function SEOHead({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | 212Learn`;
    } else {
      document.title = '212Learn - Élevez votre parcours d\'apprentissage';
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      } else {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        metaDesc.content = description;
        document.head.appendChild(metaDesc);
      }
    }
  }, [title, description]);

  return null;
}
