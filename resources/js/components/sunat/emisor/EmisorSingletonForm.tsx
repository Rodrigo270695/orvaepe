import { Transition } from '@headlessui/react';
import { Form } from '@inertiajs/react';
import { Save } from 'lucide-react';

import { AdminToast } from '@/components/ui/admin-toast';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import EmisorAddressFields from './EmisorAddressFields';
import EmisorContactFields from './EmisorContactFields';
import EmisorGeneralFields from './EmisorGeneralFields';
import type { CompanyLegalProfile, FormErrors } from '@/components/sunat/emisor/types';

type Props = {
    profile: CompanyLegalProfile | null;
};

export default function EmisorSingletonForm({ profile }: Props) {
    return (
        <Form
            action="/panel/sunat-emisor"
            method="post"
            options={{ preserveScroll: true }}
            className="space-y-6"
        >
            {({ processing, recentlySuccessful, errors }) => (
                <>
                    <div className="space-y-6">
                            <EmisorGeneralFields
                                profile={profile}
                                errors={errors as FormErrors}
                            />
                            <EmisorAddressFields
                                profile={profile}
                                errors={errors as FormErrors}
                            />
                            <EmisorContactFields
                                profile={profile}
                                errors={errors as FormErrors}
                            />
                    </div>

                    <input type="hidden" name="_method" value="patch" />
                    <input type="hidden" name="is_default_issuer" value="1" />
                    <input type="hidden" name="country" value="PE" />

                    <div className="admin-toast-stack">
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-[-6px]"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-[-6px]"
                        >
                            <AdminToast
                                type="success"
                                title="Se ha guardado la configuración"
                            />
                        </Transition>

                        {!recentlySuccessful &&
                            Object.keys(errors).length > 0 && (
                                <Transition
                                    show
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-[-6px]"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-[-6px]"
                                >
                                    <AdminToast
                                        type={
                                            // Si en el futuro llega una “alerta” como key global
                                            // en vez de errores de campos, se mapeará a warning.
                                            (errors as Record<
                                                string,
                                                unknown
                                            >).alert
                                                ? 'warning'
                                                : 'error'
                                        }
                                        title="No se pudo guardar"
                                        description="Revisa los campos y vuelve a intentar."
                                    />
                                </Transition>
                            )}
                    </div>

                    <div className="sticky bottom-0 z-10 px-1 pt-2 pb-1 md:px-0">
                        <div className="flex items-center gap-4">
                            <NeuButtonRaised
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer"
                            >
                                <Save className="size-4 text-[#D28C3C]" />
                                {processing
                                    ? 'Guardando...'
                                    : 'Guardar cambios'}
                            </NeuButtonRaised>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

