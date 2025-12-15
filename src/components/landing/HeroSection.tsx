'use client'

import Button from '../ui/Button'
import styles from '@/styles/HeroSection.module.css'

export interface HeroSectionProps {
    backgroundImage?: string
    title: string
    subtitle: string
    ctaText: string
    ctaHref?: string
    onCtaClick?: () => void
}

export default function HeroSection({
    backgroundImage,
    title,
    subtitle,
    ctaText,
    ctaHref = '#servicios',
    onCtaClick,
}: HeroSectionProps) {
    return (
        <section
            className={`${styles.hero} ${backgroundImage ? styles.heroBackground : ''}`}
            style={{
                backgroundImage: backgroundImage
                    ? `url(${backgroundImage})`
                    : undefined,
            }}
        >
            {/* Overlay oscuro con gradiente */}
            <div className={styles.overlay} />

            {/* Contenido */}
            <div className={styles.content}>
                <div className={styles.innerContent}>
                    {/* Título principal */}
                    <h1 className={styles.title}>
                        {title}
                    </h1>

                    {/* Subtítulo */}
                    <p className={styles.subtitle}>
                        {subtitle}
                    </p>

                    {/* Call to Action */}
                    <div className={styles.ctaContainer}>
                        {onCtaClick ? (
                            <Button
                                size="lg"
                                variant="primary"
                                onClick={onCtaClick}
                                className="text-lg px-8 py-4"
                            >
                                {ctaText}
                            </Button>
                        ) : (
                            <a href={ctaHref}>
                                <Button
                                    size="lg"
                                    variant="primary"
                                    className="text-lg px-8 py-4"
                                >
                                    {ctaText}
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Indicadores de página (dots) */}
            <div className={styles.indicators}>
                {[1, 2, 3, 4].map((dot) => (
                    <div
                        key={dot}
                        className={`${styles.indicator} ${
                            dot === 1
                                ? styles.indicatorActive
                                : styles.indicatorInactive
                        }`}
                    />
                ))}
            </div>
        </section>
    )
}
