import { Router } from 'express';
import { buildAdminRoutes } from './adminRoutes';
import { buildAIRoutes } from './aiRoutes';
import { buildAuthRoutes } from './authRoutes';
import { buildHealthRoutes } from './healthRoutes';
import { buildMalwareRoutes } from './malwareRoutes';
import { buildPentestRoutes } from './pentestRoutes';
import { buildSOCRoutes } from './socRoutes';
import { buildThreatIntelRoutes } from './threatIntelRoutes';

export function buildRouter(): Router {
  const router = Router();

  router.use('/auth', buildAuthRoutes());
  router.use('/health', buildHealthRoutes());
  router.use('/soc', buildSOCRoutes());
  router.use('/malware', buildMalwareRoutes());
  router.use('/threat-intel', buildThreatIntelRoutes());
  router.use('/pentest', buildPentestRoutes());
  router.use('/admin', buildAdminRoutes());
  router.use('/ai', buildAIRoutes());

  return router;
}
