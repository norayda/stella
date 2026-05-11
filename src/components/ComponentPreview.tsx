import React, { Suspense } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

/*-krisspy-code-start*/
// Auto-generated manifest data from system
const manifest = {
  "version": 1,
  "settings": {
    "framework": "react",
    "enableGuards": false,
    "baseUrl": "/"
  },
  "routes": [
    {
      "id": ".src.pages.designsystemtest",
      "file": "/src/pages/DesignSystemTest.tsx",
      "path": "/design-system",
      "pathExample": null,
      "component": "DesignSystemTest",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "Design System",
      "description": "Live design system — all elements respond to ThemeEditor in real time",
      "design": "template",
      "updatedAt": "2026-05-10T23:11:22.853Z"
    },
    {
      "id": ".src.pages.notfound",
      "file": "/src/pages/NotFound.tsx",
      "path": [
        "*",
        "/404"
      ],
      "pathExample": null,
      "component": "NotFound",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "404 — Not Found",
      "description": "Fallback 404 page for unmatched routes",
      "design": "template",
      "updatedAt": "2026-05-10T23:11:22.853Z"
    },
    {
      "id": ".src.pages.stellawelcome",
      "file": "/src/pages/StellaWelcome.tsx",
      "path": [
        "/",
        "/welcome"
      ],
      "pathExample": null,
      "component": "StellaWelcome",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Bienvenue",
      "description": "Écran d'accueil et authentification de STELLA, assistant mobilité intelligent. Bilingue FR/EN avec modal transparence des données.",
      "design": "reference",
      "updatedAt": "2026-05-10T23:11:22.853Z"
    },
    {
      "id": ".src.pages.stellaname",
      "file": "/src/pages/StellaName.tsx",
      "path": "/name",
      "pathExample": null,
      "component": "StellaName",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Votre prénom",
      "description": "Écran d'onboarding : l'utilisateur choisit comment STELLA doit l'appeler. Auto-focus, validation instantanée, ton chaleureux et appropriation.",
      "updatedAt": "2026-05-10T23:11:22.853Z"
    },
    {
      "id": ".src.pages.stellapersonalization",
      "file": "/src/pages/StellaPersonalization.tsx",
      "path": "/personalization",
      "pathExample": null,
      "component": "StellaPersonalization",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Personnalisation",
      "description": "Écran d'onboarding post-inscription : objectifs, niveau de conduite, préférences de trajet, assistant vocal. Sticky CTA, chips, zéro donnée sensible.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellavehicle",
      "file": "/src/pages/StellaVehicle.tsx",
      "path": "/vehicle",
      "pathExample": null,
      "component": "StellaVehicle",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Mon véhicule",
      "description": "Configuration rapide du véhicule (marque, modèle, motorisation, année, kilométrage) pour personnaliser les insights STELLA.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellaready",
      "file": "/src/pages/StellaReady.tsx",
      "path": [
        "/ready",
        "/welcome-back"
      ],
      "pathExample": null,
      "component": "StellaReady",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Bon retour",
      "description": "Écran de transition post-onboarding : hero véhicule avec animation de scan, chargement du profil IA, récapitulatif personnalisé et CTA d'entrée dans l'app.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellahome",
      "file": "/src/pages/StellaHome.tsx",
      "path": [
        "/home",
        "/dashboard"
      ],
      "pathExample": null,
      "component": "StellaHome",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Accueil",
      "description": "Tableau de bord principal : statut véhicule, insights IA, alertes maintenance, actions vocales rapides, SOS et navigation bas.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellasos",
      "file": "/src/pages/StellaSOS.tsx",
      "path": "/sos",
      "pathExample": null,
      "component": "StellaSOS",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Aide d'urgence",
      "description": "Écran SOS avec numéros d'urgence français : SAMU 15, Pompiers 18, Gendarmerie 17, Violences conjugales 3919. Contraste élevé, tap-to-call.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellacopilot",
      "file": "/src/pages/StellaCopilot.tsx",
      "path": "/copilot",
      "pathExample": null,
      "component": "StellaCopilot",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Copilote",
      "description": "Écran de chat copilote IA : suggestions rapides, thread conversationnel, reconnaissance vocale simulée. Bilingue FR/EN, réponses mock côté client.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellagarage",
      "file": "/src/pages/StellaGarage.tsx",
      "path": "/garage",
      "pathExample": null,
      "component": "StellaGarage",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Analyser un devis",
      "description": "Écran d'analyse de devis garage : aperçu du document, résumé structuré (total, verdict, pièces/main d'œuvre, urgence), insights, recommandation et garages partenaires.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellatrips",
      "file": "/src/pages/StellaTrips.tsx",
      "path": "/trips",
      "pathExample": null,
      "component": "StellaTrips",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Trajets & Voyages",
      "description": "Deux onglets : Trajets urbains et Voyages. Autocomplétion d'adresses Nominatim, calcul d'itinéraire OSRM, carte Leaflet, géolocalisation, lancement Google Maps.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellarewards",
      "file": "/src/pages/StellaRewards.tsx",
      "path": [
        "/rewards",
        "/avantages"
      ],
      "pathExample": null,
      "component": "StellaRewards",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Avantages",
      "description": "Écran Avantages / STELLA Points : solde, tier, progression vers la prochaine récompense, sources de points, récompenses disponibles, partenaires, actions rapides.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellamaintenancehistory",
      "file": "/src/pages/StellaMaintenanceHistory.tsx",
      "path": "/maintenance-history",
      "pathExample": null,
      "component": "StellaMaintenanceHistory",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Carnet d'entretien",
      "description": "Historique complet des entretiens du véhicule : timeline, ajout, partage.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellamodes",
      "file": "/src/pages/StellaModes.tsx",
      "path": "/settings/modes",
      "pathExample": null,
      "component": "StellaModes",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Modes",
      "description": "Modes Stella : langue, mode sombre, daltonien, accessibilité, éco, nouvelle conductrice, voix, profil conductrice.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellaprofile",
      "file": "/src/pages/StellaProfile.tsx",
      "path": [
        "/profile",
        "/profil"
      ],
      "pathExample": null,
      "component": "StellaProfile",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Profil",
      "description": "Profil utilisateur : hero, véhicule, stats, abonnement, carnet d'entretien, lexique auto, menu réglages, connexion compte, footer.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellasettings",
      "file": "/src/pages/StellaSettings.tsx",
      "path": "/settings",
      "pathExample": null,
      "component": "StellaSettings",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Réglages",
      "description": "Réglages utilisateur : notifications, confort, confidentialité, données, compte. Tous les toggles fonctionnels.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellaaccessibility",
      "file": "/src/pages/StellaAccessibility.tsx",
      "path": "/settings/accessibility",
      "pathExample": null,
      "component": "StellaAccessibility",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Accessibilité",
      "description": "Réglages accessibilité : priorité voix, texte large, daltonien, réduction anim, vibrations, lecture alertes, contraste. Avec aperçu live.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellachangevehicle",
      "file": "/src/pages/StellaChangeVehicle.tsx",
      "path": "/change-vehicle",
      "pathExample": null,
      "component": "StellaChangeVehicle",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Changer de voiture",
      "description": "Mettre à jour les informations du véhicule tout en conservant points et historique.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellacontact",
      "file": "/src/pages/StellaContact.tsx",
      "path": "/contact",
      "pathExample": null,
      "component": "StellaContact",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Support Jeep Heart",
      "description": "Page de support Jeep Heart : aide et support, chat avec Stella. Coordonnées service client.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellafavorites",
      "file": "/src/pages/StellaFavorites.tsx",
      "path": "/favorites",
      "pathExample": null,
      "component": "StellaFavorites",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Favoris",
      "description": "Lieux et trajets favoris de l'utilisateur — onglets Lieux / Trajets.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellainterests",
      "file": "/src/pages/StellaInterests.tsx",
      "path": "/interests",
      "pathExample": null,
      "component": "StellaInterests",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Centres d'intérêt",
      "description": "Centres d'intérêt multi-select pour personnaliser les conseils Stella.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellanotifications",
      "file": "/src/pages/StellaNotifications.tsx",
      "path": "/notifications",
      "pathExample": null,
      "component": "StellaNotifications",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Notifications",
      "description": "Préférences de notifications : rappels entretien, résumés trajets, astuces éco, alertes vitesse/radar/obstacles, DND.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellapayment",
      "file": "/src/pages/StellaPayment.tsx",
      "path": "/payment",
      "pathExample": null,
      "component": "StellaPayment",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Paiement",
      "description": "Mode de paiement : plan actuel, carte enregistrée, bascule Premium, pack famille, historique.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    },
    {
      "id": ".src.pages.stellalogin",
      "file": "/src/pages/StellaLogin.tsx",
      "path": [
        "/login",
        "/connexion"
      ],
      "pathExample": null,
      "component": "StellaLogin",
      "layout": null,
      "guards": null,
      "requiresAuth": false,
      "title": "STELLA — Connexion",
      "description": "Écran de connexion : email + mot de passe, mot de passe oublié, lien vers la création de compte. Bilingue FR/EN.",
      "updatedAt": "2026-05-10T23:11:22.854Z"
    }
  ],
  "components": [],
  "layouts": [],
  "updatedAt": "2026-05-10T23:10:44.765Z",
  "updatedBy": "say1vffth0esxwvof59znk"
};
/*-krisspy-code-end*/

function DynamicComponent({ modulePromise, exportName, props }: any) {
  const [Comp, setComp] = React.useState<any>(null);
  
  React.useEffect(() => {
    let mounted = true;
    modulePromise.then((m: any) => {
      if (mounted) {
        const component = exportName === 'default' ? m.default : m[exportName];
        setComp(() => component);
      }
    }).catch(() => {
      if (mounted) setComp(null);
    });
    return () => { mounted = false; };
  }, [modulePromise, exportName]);
  
  if (!Comp) return <div>Loading component...</div>;
  return <Comp {...props} />;
}

export default function ComponentPreview() {
  const [searchParams] = useSearchParams();
  const componentId = searchParams.get('id');
  
  if (!componentId) {
    return <div>No component ID specified</div>;
  }
  
  const comp = manifest.components?.find((c: any) => c.id === componentId);
  if (!comp) {
    return <div>Component "{componentId}" not found</div>;
  }
  
  const variantSlug = searchParams.get('variant') || comp.variants?.[0]?.slug || 'default';
  const variant = comp.variants?.find((v: any) => v.slug === variantSlug) || comp.variants?.[0];
  
  const width = Number(searchParams.get('w') || comp.canvas?.width || 600);
  const height = Number(searchParams.get('h') || comp.canvas?.height || 400);
  
  const modulePromise = import(/* @vite-ignore */ comp.file.replace('./src/components/', './'));
  const exportName = comp.export === 'default' || !comp.export ? 'default' : comp.export;
  
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      margin: 0, 
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent'
    }}>
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicComponent 
          modulePromise={modulePromise}
          exportName={exportName}
          props={variant?.props || {}} 
        />
      </Suspense>
    </div>
  );
}

export const ComponentPreviewRouter: React.FC = () => {
  return <ComponentPreview />;
};

function PageRouter() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Find the matching route in the manifest
  const route = manifest.routes?.find((r: any) => r.path === currentPath);
  
  if (!route) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page "{currentPath}" does not exist.</p>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          Go back to home
        </a>
      </div>
    );
  }
  
  // Check guards/permissions if enabled
  if (manifest.settings?.enableGuards && route.guards) {
    for (const guard of route.guards) {
      if (guard === 'auth') {
        // Simulate auth check - in real app, this would check actual auth state
        const isAuthenticated = false; // This would come from your auth context/store
        
        if (!isAuthenticated) {
          return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>Authentication Required</h1>
              <p>You need to be logged in to access "{route.title}"</p>
              <button style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}>
                Sign In
              </button>
            </div>
          );
        }
      }
    }
  }
  
  // Build layout chain by following parent dependencies
  const buildLayoutChain = (layoutName: string | null): string[] => {
    const chain: string[] = [];
    let currentLayoutName = layoutName;
    
    while (currentLayoutName) {
      chain.push(currentLayoutName);
      const layout = manifest.layouts?.find((l: any) => l.name === currentLayoutName);
      currentLayoutName = layout?.parent || null;
    }
    
    return chain.reverse(); // Reverse to get outermost first
  };
  
  const initialLayoutName = route.meta?.layout || manifest.settings?.defaultLayout || null;
  const layoutChain = buildLayoutChain(initialLayoutName);
  
  const pageModulePromise = import(/* @vite-ignore */ route.file.replace('./src/', '../'));
  
  // If no layouts, render page directly
  if (layoutChain.length === 0) {
    return (
      <Suspense fallback={<div>Loading {route.title || route.component}...</div>}>
        <DynamicComponent 
          modulePromise={pageModulePromise}
          exportName="default"
          props={{}} 
        />
      </Suspense>
    );
  }
  
  // Render page wrapped in nested layouts (recursive)
  const renderWithLayouts = (layoutIndex: number, children: React.ReactNode): React.ReactNode => {
    if (layoutIndex >= layoutChain.length) {
      return children;
    }
    
    const layoutName = layoutChain[layoutIndex];
    const layout = manifest.layouts?.find((l: any) => l.name === layoutName);
    
    if (!layout) {
      console.warn(`Layout "${layoutName}" not found in manifest`);
      return renderWithLayouts(layoutIndex + 1, children);
    }
    
    const layoutModulePromise = import(/* @vite-ignore */ layout.file.replace('./src/', '../'));
    
    return (
      <DynamicComponent 
        modulePromise={layoutModulePromise}
        exportName={layout.export || 'default'}
        props={{
          children: renderWithLayouts(layoutIndex + 1, children)
        }} 
      />
    );
  };
  
  const pageComponent = (
    <DynamicComponent 
      modulePromise={pageModulePromise}
      exportName="default"
      props={{}} 
    />
  );
  
  return (
    <Suspense fallback={<div>Loading {route.title || route.component}...</div>}>
      {renderWithLayouts(0, pageComponent)}
    </Suspense>
  );
}

export const PagePreviewRouter: React.FC = () => {
  return <PageRouter />;
};