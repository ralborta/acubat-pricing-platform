import cron from 'node-cron';
import { DateTime } from 'luxon';

class BusinessScheduler {
  constructor() {
    this.schedules = new Map();
    this.isOpen = false;
    this.currentSchedule = null;
  }

  // Crear un nuevo horario de negocio
  createSchedule(scheduleData) {
    const {
      name,
      timezone = 'America/Argentina/Buenos_Aires',
      byDay = ['MO', 'TU', 'WE', 'TH', 'FR'], // Lunes a Viernes por defecto
      start = '09:00',
      end = '18:00',
      rdates = [], // Fechas especiales (incluir)
      exdates = [] // Fechas a excluir
    } = scheduleData;

    const schedule = {
      id: Date.now().toString(),
      name,
      timezone,
      byDay,
      start,
      end,
      rdates,
      exdates,
      cronExpression: this.generateCronExpression(byDay, start, end),
      createdAt: DateTime.now().setZone(timezone)
    };

    this.schedules.set(schedule.id, schedule);
    this.scheduleJobs(schedule);
    
    return schedule;
  }

  // Generar expresión cron basada en días y horarios
  generateCronExpression(byDay, start, end) {
    const dayMap = {
      'MO': '1', // Lunes
      'TU': '2', // Martes
      'WE': '3', // Miércoles
      'TH': '4', // Jueves
      'FR': '5', // Viernes
      'SA': '6', // Sábado
      'SU': '0'  // Domingo
    };

    const days = byDay.map(day => dayMap[day]).join(',');
    const [startHour, startMinute] = start.split(':');
    const [endHour, endMinute] = end.split(':');

    return {
      open: `${startMinute} ${startHour} * * ${days}`,
      close: `${endMinute} ${endHour} * * ${days}`
    };
  }

  // Programar jobs de apertura y cierre
  scheduleJobs(schedule) {
    const { cronExpression } = schedule;

    // Job de apertura
    cron.schedule(cronExpression.open, () => {
      this.openBusiness(schedule);
    }, {
      timezone: schedule.timezone
    });

    // Job de cierre
    cron.schedule(cronExpression.close, () => {
      this.closeBusiness(schedule);
    }, {
      timezone: schedule.timezone
    });

    // Programar fechas especiales (RDATE)
    this.scheduleSpecialDates(schedule);

    console.log(`✅ Horario programado: ${schedule.name}`);
    console.log(`   Apertura: ${schedule.start} - Cierre: ${schedule.end}`);
    console.log(`   Días: ${schedule.byDay.join(', ')}`);
  }

  // Programar fechas especiales
  scheduleSpecialDates(schedule) {
    schedule.rdates.forEach(dateStr => {
      const date = DateTime.fromISO(dateStr).setZone(schedule.timezone);
      const [startHour, startMinute] = schedule.start.split(':');
      const [endHour, endMinute] = schedule.end.split(':');

      // Apertura en fecha especial
      const openTime = date.set({ hour: parseInt(startHour), minute: parseInt(startMinute) });
      if (openTime > DateTime.now()) {
        setTimeout(() => {
          this.openBusiness(schedule);
        }, openTime.diff(DateTime.now()).toMillis());
      }

      // Cierre en fecha especial
      const closeTime = date.set({ hour: parseInt(endHour), minute: parseInt(endMinute) });
      if (closeTime > DateTime.now()) {
        setTimeout(() => {
          this.closeBusiness(schedule);
        }, closeTime.diff(DateTime.now()).toMillis());
      }
    });
  }

  // Abrir negocio
  openBusiness(schedule) {
    this.isOpen = true;
    this.currentSchedule = schedule;
    
    console.log(`🚪 ABRIR NEGOCIO: ${schedule.name}`);
    console.log(`   Hora: ${DateTime.now().setZone(schedule.timezone).toFormat('HH:mm')}`);
    console.log(`   Timezone: ${schedule.timezone}`);
    
    // Aquí puedes agregar lógica adicional:
    // - Enviar webhook
    // - Habilitar servicios
    // - Notificar usuarios
    // - etc.
  }

  // Cerrar negocio
  closeBusiness(schedule) {
    this.isOpen = false;
    this.currentSchedule = null;
    
    console.log(`🔒 CERRAR NEGOCIO: ${schedule.name}`);
    console.log(`   Hora: ${DateTime.now().setZone(schedule.timezone).toFormat('HH:mm')}`);
    console.log(`   Timezone: ${schedule.timezone}`);
    
    // Aquí puedes agregar lógica adicional:
    // - Deshabilitar servicios
    // - Guardar logs
    // - Notificar usuarios
    // - etc.
  }

  // Verificar si el negocio está abierto
  isBusinessOpen() {
    return this.isOpen;
  }

  // Obtener horario actual
  getCurrentSchedule() {
    return this.currentSchedule;
  }

  // Obtener todos los horarios
  getAllSchedules() {
    return Array.from(this.schedules.values());
  }

  // Eliminar un horario
  removeSchedule(scheduleId) {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      // Aquí podrías cancelar los jobs de cron si fuera necesario
      this.schedules.delete(scheduleId);
      console.log(`🗑️ Horario eliminado: ${schedule.name}`);
      return true;
    }
    return false;
  }

  // Actualizar un horario existente
  updateSchedule(scheduleId, updates) {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      const updatedSchedule = { ...schedule, ...updates };
      this.schedules.set(scheduleId, updatedSchedule);
      
      // Reprogramar jobs
      this.removeSchedule(scheduleId);
      this.createSchedule(updatedSchedule);
      
      return updatedSchedule;
    }
    return null;
  }

  // Obtener próximo horario de apertura
  getNextOpening(scheduleId) {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return null;

    const now = DateTime.now().setZone(schedule.timezone);
    const [startHour, startMinute] = schedule.start.split(':');
    
    // Buscar próximo día de apertura
    for (let i = 0; i < 7; i++) {
      const nextDay = now.plus({ days: i });
      const dayOfWeek = nextDay.weekday;
      
      const dayMap = {
        1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA', 7: 'SU'
      };
      
      if (schedule.byDay.includes(dayMap[dayOfWeek])) {
        const nextOpening = nextDay.set({ 
          hour: parseInt(startHour), 
          minute: parseInt(startMinute) 
        });
        
        if (nextOpening > now) {
          return nextOpening;
        }
      }
    }
    
    return null;
  }
}

// Instancia global del scheduler
const businessScheduler = new BusinessScheduler();

export default businessScheduler;
