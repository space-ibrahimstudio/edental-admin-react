const data = {
  status: 202,
  error: false,
  TTLData: 1,
  data: {
    entry: [
      {
        fullUrl: "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Practitioner/10009880728",
        resource: {
          address: [
            {
              city: "Kab. Garut",
              country: "ID",
              extension: [
                {
                  extension: [
                    {
                      url: "province",
                      valueCode: "32",
                    },
                    {
                      url: "city",
                      valueCode: "3205",
                    },
                    {
                      url: "district",
                      valueCode: "320519",
                    },
                    {
                      url: "village",
                      valueCode: "3205192003",
                    },
                    {
                      url: "rw",
                      valueCode: "1",
                    },
                    {
                      url: "rt",
                      valueCode: "12",
                    },
                  ],
                  url: "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode",
                },
              ],
              line: ["Komplek Kesehatan"],
              use: "home",
            },
          ],
          birthDate: "1994-01-01",
          gender: "male",
          id: "10009880728",
          identifier: [
            {
              system: "https://fhir.kemkes.go.id/id/nakes-his-number",
              value: "10009880728",
            },
            {
              system: "https://fhir.kemkes.go.id/id/nik",
              use: "official",
              value: "7209061211900001",
            },
          ],
          meta: {
            lastUpdated: "2024-08-23T02:13:21.958425+00:00",
            versionId: "MTcyNDM3OTIwMTk1ODQyNTAwMA",
          },
          name: [
            {
              text: "Practitioner 1",
              use: "official",
            },
          ],
          qualification: [
            {
              code: {
                coding: [
                  {
                    code: "STR-KKI",
                    display: "Surat Tanda Registrasi Dokter",
                    system: "https://terminology.kemkes.go.id/v1-0302",
                  },
                ],
              },
              identifier: [
                {
                  system: "https://fhir.kemkes.go.id/id/str-kki-number",
                  value: "1234567887654321",
                },
              ],
            },
          ],
          resourceType: "Practitioner",
        },
      },
    ],
    link: [
      {
        relation: "search",
        url: "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Practitioner/?identifier=https%3A%2F%2Ffhir.kemkes.go.id%2Fid%2Fnik%7C7209061211900001",
      },
      {
        relation: "first",
        url: "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Practitioner/?identifier=https%3A%2F%2Ffhir.kemkes.go.id%2Fid%2Fnik%7C7209061211900001",
      },
      {
        relation: "self",
        url: "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Practitioner/?identifier=https%3A%2F%2Ffhir.kemkes.go.id%2Fid%2Fnik%7C7209061211900001",
      },
    ],
    resourceType: "Bundle",
    total: 1,
    type: "searchset",
  },
};

const submittedData = { secret, city: data.data.entry[0].resource.address[0].extension[0].extension[1].valueCode, province: data.data.entry[0].resource.address[0].extension[0].extension[0].valueCode, district: data.data.entry[0].resource.address[0].extension[0].extension[2].valueCode, village: data.data.entry[0].resource.address[0].extension[0].extension[3].valueCode, rt: data.data.entry[0].resource.address[0].extension[0].extension[4].valueCode, rw: data.data.entry[0].resource.address[0].extension[0].extension[5].valueCode, address: data.data.entry[0].resource.address[0].line[0], birthDate: data.data.entry[0].resource.birthDate, gender: data.data.entry[0].resource.gender, id: data.data.entry[0].resource.id, str: data.data.entry[0].resource.qualification[0].identifier[0].value };
