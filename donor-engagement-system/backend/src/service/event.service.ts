import { Pool } from 'mysql2/promise';
import { Event } from '../types/event.types';
import { Fundraiser } from '../types/fundraiser.types';
import { EventRepository } from '../repositories/event.repository';
import { FundraiserRepository } from '../repositories/fundraiser.repository';
import { DateTime } from 'luxon';

export class EventService {
    constructor(private pool: Pool) {}

    async getEventWithRelations(eventId: number): Promise<Event & { 
        assigned_fundraisers: Fundraiser[], 
        organizer: Fundraiser 
    }> {
        const eventRepository = new EventRepository(this.pool);
        const fundraiserRepository = new FundraiserRepository(this.pool);
        // Get base event
        const event = await eventRepository.findById(eventId);
        if (!event) {
            throw new Error(`Get Event Relations: Event with id ${eventId} not found`);
        }

        // Get assigned fundraisers
        const assignedFundraisers = await eventRepository.getEventFundraisers(eventId);

        // Get organizer
        const organizer = await fundraiserRepository.findByFundraiserId(event.organizer_id);
        if (!organizer) {
            throw new Error(`Get Event Relations: Organizer with id ${event.organizer_id} not found`);
        }

        // Combine the data
        return {
            ...event,
            assigned_fundraisers: assignedFundraisers,
            organizer: organizer
        };
    }

    async getFundraiserEventsWithRelations(fundraiserId: number): Promise<(Event & {
        assigned_fundraisers: Fundraiser[],
        organizer: Fundraiser
    })[]> {
        const eventRepository = new EventRepository(this.pool);
        const fundraiserRepository = new FundraiserRepository(this.pool);
        // Get base events
        const events = await eventRepository.getFundraiserEvents(fundraiserId);

        // Map each event to include relations
        const eventsWithRelations = await Promise.all(events.map(async (event) => {
            const assignedFundraisers = await eventRepository.getEventFundraisers(event.id);
            const organizer = await fundraiserRepository.findByFundraiserId(event.organizer_id);
            
            if (!organizer) {
                throw new Error(`getFundraiserEventsWithRelations Error: Organizer with id ${event.organizer_id} not found`);
            }

            return {
                ...event,
                assigned_fundraisers: assignedFundraisers,
                organizer: organizer
            };
        }));

        return eventsWithRelations;
    }

    async getDashboardEvents(fundraiserId: number): Promise<(Event & {
        assigned_fundraisers: Fundraiser[],
        organizer: Fundraiser
    })[]> {
        const eventRepository = new EventRepository(this.pool);
        const fundraiserRepository = new FundraiserRepository(this.pool);
        const events = await eventRepository.getFundraiserEvents(fundraiserId);
        const today = DateTime.now();
        const filteredEvents = events.filter(event => event.start_time > today);
        
        // Map filtered events to include relations
        const eventsWithRelations = await Promise.all(filteredEvents.map(async (event) => {
            const assignedFundraisers = await eventRepository.getEventFundraisers(event.id);
            const organizer = await fundraiserRepository.findByFundraiserId(event.organizer_id);
            
            if (!organizer) {
                throw new Error(`Organizer with id ${event.organizer_id} not found`);
            }

            return {
                ...event,
                assigned_fundraisers: assignedFundraisers,
                organizer: organizer
            };
        }));

        
        return eventsWithRelations;
    }

    async createEvent(event: Event): Promise<number> {
        const eventRepository = new EventRepository(this.pool);
        // insert event into Events table
        const newEventId = await eventRepository.createEvent(event);

        // find the event with the new id
        const newEvent = await eventRepository.findById(newEventId);

        if (!newEvent) {
            throw new Error(`Event with id ${newEventId} not found`);
        }
        console.log('New event in Service:', newEvent);

        // get the city from the location
        const city = newEvent.location.split(',')
            .map(part => part.trim())
            .pop() || ''; // Get the last part after splitting by comma
        
        // select donors for the event
        const donorIds = await eventRepository.selectDonorIdsForEvent(city, newEvent.expected_selection);
        console.log('Donor ID numbers:', donorIds.length);
        // find the fundraiser for each donor
        for (const donorId of donorIds) {   
            const fundraiserId = await eventRepository.findFundraiserIdFromDonorId(donorId);
            if (!fundraiserId) {
                throw new Error(`Fundraiser with id ${fundraiserId} not found`);
            }
            // assign the fundraiser to the event
            const eventFundraiserId = await eventRepository.insertEventFundraiser(newEventId, fundraiserId);

            // create the Selections table
            await eventRepository.createSelections(donorId, newEventId, eventFundraiserId);
        }

        return newEventId;
    }

    async getUpcomingEvents(): Promise<Event[]> {
        const eventRepository = new EventRepository(this.pool);
        const events = await eventRepository.getUpcomingEvents();
        const today = DateTime.now();
        const upcomingEvents = events.filter(event => event.start_time > today);
        
        return upcomingEvents;
    }

    async getAllEvents(): Promise<Event[]> {
        const eventRepository = new EventRepository(this.pool);
        const fundraiserRepository = new FundraiserRepository(this.pool);
        const events = await eventRepository.getAllEvents();
    
        const eventsWithOrganizerNames = await Promise.all(events.map(async (event) => {
          const organizer = await fundraiserRepository.findByFundraiserId(event.organizer_id);
    
          if (!organizer) {
            throw new Error(`Organizer with id ${event.organizer_id} not found`);
          }
    
          return {
            ...event,
            organizer: organizer
          };
        }));
    
        return eventsWithOrganizerNames;
    }
    
    
    async getEventsByStatus(): Promise<{ 
        finishedEvents: Event[], 
        waitingEvents: Event[] 
    }> {
        const [results] = await this.pool.execute(`
            WITH EventFundraiserCounts AS (
                SELECT 
                    e.id as event_id,
                    COUNT(DISTINCT ef.fundraiser_id) as total_fundraisers,
                    COUNT(DISTINCT CASE 
                        WHEN EXISTS (
                            SELECT 1 
                            FROM Selections s 
                            WHERE s.event_fundraiser_id = ef.id 
                            AND s.state = 'confirmed'
                        ) 
                        THEN ef.fundraiser_id 
                    END) as fundraisers_with_confirmed
                FROM Events e
                LEFT JOIN Event_Fundraisers ef ON e.id = ef.event_id
                GROUP BY e.id
            )
            SELECT 
                e.*,
                efc.total_fundraisers,
                efc.fundraisers_with_confirmed,
                CASE 
                    WHEN efc.total_fundraisers = efc.fundraisers_with_confirmed 
                    THEN true 
                    ELSE false 
                END as is_finished
            FROM Events e
            JOIN EventFundraiserCounts efc ON e.id = efc.event_id
        `) as [any[], any];

        const finishedEvents = results.filter(event => event.is_finished);
        const waitingEvents = results.filter(event => !event.is_finished);

        return {
            finishedEvents,
            waitingEvents
        };
    }


  }
