// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import CongratulationsJohn from '@views/apps/ecommerce/dashboard/Congratulations'
import StatisticsCard from '@views/apps/ecommerce/dashboard/StatisticsCard'
import LineChartProfit from '@views/apps/ecommerce/dashboard/LineChartProfit'
import RadialBarChart from '@views/apps/ecommerce/dashboard/RadialBarChart'
import DonutChartGeneratedLeads from '@views/apps/ecommerce/dashboard/DonutChartGeneratedLeads'
import RecentChatsTable from '@views/apps/ecommerce/dashboard/RecentChatsTable'

const ChatbotDashboard = async () => {
  return (
    <Grid container spacing={6}>
      {/* แถวที่ 1 */}
      <Grid size={{ xs: 12, md: 4 }}>
        <CongratulationsJohn />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <StatisticsCard />
      </Grid>

      {/* แถวที่ 2: กราฟเรียงซ้าย กลาง ขวา เมื่อเป็นจอใหญ่ */}
      <Grid size={{ xs: 12, md: 4 }}>
        <RadialBarChart />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <DonutChartGeneratedLeads />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <LineChartProfit />
      </Grid>

      {/* แถวที่ 3: ตารางเต็มความกว้าง */}
      <Grid size={{ xs: 12 }}>
        <RecentChatsTable />
      </Grid>
    </Grid>
  )
}

export default ChatbotDashboard
