import app from './app';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`DesignGuardian AI Server running on http://localhost:${PORT}`);
  console.log(`- Health Check: http://localhost:${PORT}/api/health`);
  console.log(`- Rules Catalog: http://localhost:${PORT}/api/rules`);
});
