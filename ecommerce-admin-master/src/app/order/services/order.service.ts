import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable()
export class OrderService {

  constructor(private restangular: Restangular, private httpClient: HttpClient) { }

  find(params: any): Promise<any> {
    return this.restangular.one('orders').get(params).toPromise();
  }

  findAll(params: any): Promise<any> {
    return this.restangular.one('orders/getAll').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('orders', id).get().toPromise();
  }

  update(id, data): Promise<any> {
    return this.restangular.one('orders').one('details', id).one('status').customPUT(data).toPromise();
  }
  cancel(id,data): Promise<any> {
    return this.restangular.one('orders/cancel',id).customPUT(data).toPromise();
  }
  getListHub(data): Promise<any>{
    return this.httpClient.get(`${window.appConfig.dscApiBaseUrl}/hub/ListHubs?searchText=${data}`, {
        headers: {'x-api-key': `${window.appConfig.dscApiKey}`}
    }).toPromise();
  }
  reAssignShipmentHubOrWe(param): Promise<any>{
    return this.httpClient.post(`${window.appConfig.dscApiBaseUrl}/shipment/ReAssignShipmentHubOrWe`,param, {
        headers: {'x-api-key': `${window.appConfig.dscApiKey}`}
    }).toPromise();
  }
  reassignHub(id,param): Promise<any>{
    return this.restangular.one('orders/reassignHub',id).customPUT(param).toPromise();
  }
  assignHub(id,param): Promise<any>{
    return this.restangular.one('orders/assignHub',id).customPUT(param).toPromise();
  }
  acceptDelivery(id): Promise<any>{
    return this.restangular.one('orders/confirmOrderHub/', id).put().toPromise();
  }
  updateOrder(id,params): Promise<any>{
    return this.restangular.one('orders/updateOrder/', id).customPUT(params).toPromise();
  }
    exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const wb = {
      "SheetNames": [
        "Main"
      ],
      "Sheets": {
        "Main": {
          "A1": {
            "v": "This is a submerged cell",
            "s": {
              "border": {
                "left": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                },
                "top": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                },
                "bottom": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                }
              },
              "fill":{
                "bgColor":{ rgb: "8306888" },
                "fgColor":{ rgb: "8306888" },
              }
            },
            "t": "s"
          },
          "B1": {
            "v": "Pirate ship",
            "s": {
              "border": {
                "top": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                },
                "bottom": {
                  "style": "thick",
                  "color": {
                    "rgb": "FFFF0000"
                  }
                }
              }
            },
            "t": "s"
          },
          "C1": {
            "v": "Sunken treasure",
            "s": {
              "border": {
                "right": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                },
                "top": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                },
                "bottom": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                }
              }
            },
            "t": "s"
          },
          "D1": {
            "v": "Blank",
            "t": "s",
            "s":{
              "fill":{ rgb: "8306888" },
              "border": {
                "left": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                },
                "top": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                },
                "bottom": {
                  "style": "thick",
                  "color": {
                    "auto": 1
                  }
                }
              }
            }
          },
          "A9": {
            "v": "indent",
            "s": {
              "alignment": {
                "indent": "1"
              }
            },
            "t": "s"
          },
          "B9": {
            "v": "indent",
            "s": {
              "alignment": {
                "indent": "2"
              }
            },
            "t": "s"
          },
          "C9": {
            "v": "indent",
            "s": {
              "alignment": {
                "indent": "3"
              }
            },
            "t": "s"
          },
          "A10": {
            "v": "In publishing and graphic design, lorem ipsum is a filler text commonly used to demonstrate the graphic elements of a document or visual presentation. ",
            "s": {
              "alignment": {
                "wrapText": 1,
                "horizontal": "right",
                "vertical": "right",
                "indent": 1
              },
              "color": "red"
            },
            "t": "s"
          },
          "A11": {
            "v": 41684.35264774306,
            "s": {
              "numFmt": "m/d/yy"
            },
            "t": "n"
          },
          "B11": {
            "v": 41684.35264774306,
            "s": {
              "numFmt": "d-mmm-yy"
            },
            "t": "n"
          },
          "C11": {
            "v": 41684.35264774306,
            "s": {
              "numFmt": "h:mm:ss AM/PM"
            },
            "t": "n"
          },
          "D11": {
            "v": 42084.99137416667,
            "s": {
              "numFmt": "m/d/yy"
            },
            "t": "n"
          },
          "E11": {
            "v": 42065.02247239584,
            "s": {
              "numFmt": "m/d/yy"
            },
            "t": "n"
          },
          "F11": {
            "v": 42084.99137416667,
            "s": {
              "numFmt": "m/d/yy h:mm:ss AM/PM"
            },
            "t": "n"
          },
          "A12": {
            "v": "Apple",
            "s": {
              "border": {
                "top": {
                  "style": "thin"
                },
                "left": {
                  "style": "thin"
                },
                "right": {
                  "style": "thin"
                },
                "bottom": {
                  "style": "thin"
                }
              }
            },
            "t": "s"
          },
          "C12": {
            "v": "Apple",
            "s": {
              "border": {
                "diagonalUp": 1,
                "diagonalDown": 1,
                "top": {
                  "style": "dashed",
                  "color": {
                    "auto": 1
                  }
                },
                "right": {
                  "style": "medium",
                  "color": {
                    "theme": "5"
                  }
                },
                "bottom": {
                  "style": "hair",
                  "color": {
                    "theme": 5,
                    "tint": "-0.3"
                  }
                },
                "left": {
                  "style": "thin",
                  "color": {
                    "rgb": "FFFFAA00"
                  }
                },
                "diagonal": {
                  "style": "dotted",
                  "color": {
                    "auto": 1
                  }
                }
              }
            },
            "t": "s"
          },
          "E12": {
            "v": "Pear",
            "s": {
              "border": {
                "diagonalUp": 1,
                "diagonalDown": 1,
                "top": {
                  "style": "dashed",
                  "color": {
                    "auto": 1
                  }
                },
                "right": {
                  "style": "dotted",
                  "color": {
                    "theme": "5"
                  }
                },
                "bottom": {
                  "style": "mediumDashed",
                  "color": {
                    "theme": 5,
                    "tint": "-0.3"
                  }
                },
                "left": {
                  "style": "double",
                  "color": {
                    "rgb": "FFFFAA00"
                  }
                },
                "diagonal": {
                  "style": "hair",
                  "color": {
                    "auto": 1
                  }
                }
              }
            },
            "t": "s"
          },
          "A13": {
            "v": "Up 90",
            "s": {
              "alignment": {
                "textRotation": 90
              }
            },
            "t": "s"
          },
          "B13": {
            "v": "Up 45",
            "s": {
              "alignment": {
                "textRotation": 45
              }
            },
            "t": "s"
          },
          "C13": {
            "v": "Horizontal",
            "s": {
              "alignment": {
                "textRotation": 0
              }
            },
            "t": "s"
          },
          "D13": {
            "v": "Down 45",
            "s": {
              "alignment": {
                "textRotation": 135
              }
            },
            "t": "s"
          },
          "E13": {
            "v": "Down 90",
            "s": {
              "alignment": {
                "textRotation": 180
              }
            },
            "t": "s"
          },
          "F13": {
            "v": "Vertical",
            "s": {
              "alignment": {
                "textRotation": 255
              }
            },
            "t": "s"
          },
          "A14": {
            "v": "Font color test",
            "s": {
              "font": {
                "color": {
                  "rgb": "FFC6EFCE"
                }
              }
            },
            "t": "s"
          },
          "!ref": "A1:F14"
        }
      }
    }
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };  
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true},);
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
