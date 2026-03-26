import TechErrorView from '@/components/errors/TechErrorView';

export default function Error404() {
    return (
        <TechErrorView
            statusCode={404}
            title="Página no encontrada"
            description="La dirección que intentas abrir no existe o fue movida. Puede que el enlace esté desactualizado o incompleto."
            hint="Revisa la URL o vuelve al inicio para continuar navegando por el catálogo y los servicios."
        />
    );
}
