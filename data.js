const data = {
  status: 202,
  error: false,
  TTLData: 1,
  data: {
    address: {
      city: "bandung",
      country: "ID",
      extension: [
        {
          extension: [
            {
              url: "province",
              valueCode: "31",
            },
            {
              url: "city",
              valueCode: "13173",
            },
            {
              url: "district",
              valueCode: "317306",
            },
            {
              url: "village",
              valueCode: "3173021005",
            },
            {
              url: "rt",
              valueCode: "1",
            },
            {
              url: "rw",
              valueCode: "2",
            },
          ],
          url: "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode",
        },
      ],
      line: ["jlndipatiukur"],
      postalCode: "",
      use: "work",
    },
    description: "Ruang Praktek Dokter Gigi, Poli Gigi",
    id: "4630313c-5a59-467c-bed2-072ad1e31f2e",
    identifier: [
      {
        system: "http://sys-ids.kemkes.go.id/location/8681b3c4-330e-4c91-8b94-0d9af7e30ed8",
        value: "G-2-R-1A",
      },
    ],
    managingOrganization: {
      reference: "Organization/38636d04-87da-4cb7-a246-45a04055474b",
    },
    meta: {
      lastUpdated: "2024-09-05T16:48:36.376331+00:00",
      versionId: "MTcyNTU1NDkxNjM3NjMzMTAwMA",
    },
    mode: "instance",
    name: "Poli gigi",
    physicalType: {
      coding: [
        {
          code: "ro",
          display: "Room",
          system: "http://terminology.hl7.org/CodeSystem/location-physical-type",
        },
      ],
    },
    position: {
      altitude: 0,
      latitude: 106.83239885393944,
      longitude: -6.23115426275766,
    },
    resourceType: "Location",
    status: "active",
    telecom: [
      {
        system: "phone",
        use: "work",
        value: "6228766",
      },
      {
        system: "fax",
        use: "work",
        value: "2329",
      },
      {
        system: "email",
        value: "emaial@gmail.com",
      },
      {
        system: "url",
        use: "work",
        value: "sie-dental.com",
      },
    ],
  },
};

const sub = { secret: "", id: "", name: data.data.name, phone: "", email: "", address: "", cityname: "", province: "", city: "", district: "", village: "", rt: "", rw: "", description: data.data.description, identifier: data.data.identifier[0].system, reference: data.data.managingOrganization.reference };
const s = { phone: "", email: "", address: "", cityname: "", postalcode: "", province: "", city: "", district: "", village: "", rt: "", rw: "" };
