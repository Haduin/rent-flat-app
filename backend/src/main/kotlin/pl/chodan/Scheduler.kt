//package pl.chodan
//
//import org.quartz.CronScheduleBuilder
//import org.quartz.Job
//import org.quartz.JobBuilder
//import org.quartz.JobExecutionContext
//import org.quartz.TriggerBuilder.newTrigger
//import org.quartz.impl.StdSchedulerFactory
//
//class MontlyPaymentScheduler : Job {
//    override fun execute(jobExecutionContext: JobExecutionContext?) {
//        println("Cron job triggered!")
////        runBlocking { ContractService().generateNewPaymentsForActiveContracts() }
//    }
//}
//
//fun configureScheduler() {
//    val job = JobBuilder.newJob(MontlyPaymentScheduler::class.java)
//        .withIdentity("monthlyJob", "group1")
//        .build()
//
//
//    ContractService()
//
//    val trigger = newTrigger()
//        .withIdentity("monthlyTrigger", "group1")
//        .withSchedule(CronScheduleBuilder.cronSchedule("0 * * ? * *")) // Co minutę
//        .build()
//
//    val scheduler = StdSchedulerFactory.getDefaultScheduler()
//    scheduler.start()
//    scheduler.scheduleJob(job, trigger)
//
//}
