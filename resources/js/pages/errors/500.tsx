import TechErrorView from '@/components/errors/TechErrorView';

export default function Error500() {
    return (
        <TechErrorView
            statusCode={500}
            title="Error interno del sistema"
            description="Ocurrió un problema inesperado mientras procesábamos tu solicitud. Nuestro equipo puede revisar el incidente para restaurar el servicio."
            hint="Intenta nuevamente en unos minutos. Si el problema persiste, reporta el contexto de lo que estabas haciendo."
        />
    );
}
