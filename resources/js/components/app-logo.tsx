export default function AppLogo() {
    return (
        <>
            {/* Expanded sidebar: logo horizontal ORVAE (siempre en móvil/hoja; en escritorio se oculta en modo icono) */}
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <img
                    src="/logo/orvae-logo-h-transparent-light.png"
                    alt="ORVAE"
                    className="h-10 w-auto dark:hidden"
                />
                <img
                    src="/logo/orvae-logo-h-transparent-dark.png"
                    alt="ORVAE"
                    className="h-10 w-auto hidden dark:block"
                />
            </div>

            {/* Collapsed sidebar: keep the small square icon */}
            <div className="hidden group-data-[collapsible=icon]:flex aspect-square size-8 items-center justify-center bg-transparent rounded-none">
                <img
                    src="/logo/orvae-icon-negative-512.png"
                    alt="ORVAE"
                    className="h-5 w-5"
                />
            </div>
        </>
    );
}
